import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CheckSheet from "@/models/CheckSheet";
import Submission from "@/models/Submission";
import TeaCount from "@/models/TeaCount";
import Department from "@/models/Department";
import CounterLog from "@/models/CounterLog";
import TeaDeliveryLog from "@/models/TeaDeliveryLog";
import StockAudit from "@/models/StockAudit";
import OvertimeLog from "@/models/OvertimeLog";


export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "daily"; // daily or monthly
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const month = searchParams.get("month") || date.substring(0, 7); // "YYYY-MM"

    // 1. Total Checksheets in system
    const checksheets = await CheckSheet.find({ isActive: true }).select("title code category frequency slaHours");
    const totalChecksheets = checksheets.length;

    // 2. Submissions for selected period
    let submissionQuery = {};
    if (reportType === "monthly") {
      const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
      const endOfMonth = new Date(new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1));
      submissionQuery.createdAt = { $gte: startOfMonth, $lt: endOfMonth };
    } else {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      submissionQuery.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    const submissions = await Submission.find(submissionQuery)
      .populate("department", "name code")
      .populate("submittedBy", "name employeeId")
      .sort({ createdAt: -1 });

    const filledCount = submissions.length;
    const pendingCount = Math.max(0, totalChecksheets - filledCount);
    const fillupPercentage = totalChecksheets > 0 ? Math.round((filledCount / totalChecksheets) * 100) : 0;

    // 3. Tea Count (Cups) for period
    let teaQuery = {};
    let dateFilterRegex = reportType === "monthly" ? new RegExp(`^${month}`) : date;

    if (reportType === "monthly") {
      teaQuery.date = { $regex: `^${month}` };
    } else {
      teaQuery.date = date;
    }

    const teaRecords = await TeaCount.find(teaQuery).sort({ date: -1 });
    const totalTeaCount = teaRecords.reduce((acc, curr) => acc + (curr.count || 0), 0);

    // Group Tea by Department
    const teaByDept = {};
    teaRecords.forEach((t) => {
      const dName = t.departmentName || "General";
      teaByDept[dName] = (teaByDept[dName] || 0) + (t.count || 0);
    });

    // 4. Shop Floor Tea Delivery & Wastage Logs (In Liters - Sheet 3)
    const teaLitersFilter = reportType === "monthly" ? { date: { $regex: `^${month}` } } : { date };
    const teaDeliveryLogs = await TeaDeliveryLog.find(teaLitersFilter).sort({ date: -1, shift: 1 }).lean();

    const teaLitersSummary = {
      totalDeliveredLiters: teaDeliveryLogs.reduce((acc, r) => acc + (r.deliveredLiters || 0), 0),
      totalReturnedLiters: teaDeliveryLogs.reduce((acc, r) => acc + (r.returnedLiters || 0), 0),
      totalConsumedLiters: teaDeliveryLogs.reduce((acc, r) => acc + (r.consumedLiters || 0), 0),
      totalWasteLiters: teaDeliveryLogs.reduce((acc, r) => acc + (r.wasteLiters || 0), 0),
    };

    // 5. Canteen Counter & Plates Audit (Sheets 1 & 2)
    const counterFilter = reportType === "monthly" ? { date: { $regex: `^${month}` } } : { date };
    const counterLogs = await CounterLog.find(counterFilter).sort({ date: -1, shift: 1 }).lean();

    const counterSummary = {
      totalPreparedPlates: counterLogs.reduce((acc, c) => acc + (c.totalPlates || 0), 0),
      totalConsumedPlates: counterLogs.reduce((acc, c) => acc + (c.consumedPlates || 0), 0),
      totalBalancePlates: counterLogs.reduce((acc, c) => acc + (c.balancePlates || 0), 0),
    };

    // 6. Biscuit Count Audit Ledgers (Sheet 4)
    const stockFilter = reportType === "monthly" ? { date: { $regex: `^${month}` } } : { date };
    const stockAuditLogs = await StockAudit.find(stockFilter).sort({ date: -1, productId: 1 }).lean();

    // 7. Overtime (OT) Headcount Logs (2-Hour & 3-Hour OT across 6 Departments)
    const otFilter = reportType === "monthly" ? { date: { $regex: `^${month}` } } : { date };
    const overtimeLogs = await OvertimeLog.find(otFilter).sort({ date: -1, departmentName: 1 }).lean();

    const overtimeSummary = {
      totalTwoHourOT: overtimeLogs.reduce((acc, o) => acc + (o.twoHourCount || 0), 0),
      totalThreeHourOT: overtimeLogs.reduce((acc, o) => acc + (o.threeHourCount || 0), 0),
      totalOvertimeCount: overtimeLogs.reduce((acc, o) => acc + (o.totalCount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      reportType,
      period: reportType === "monthly" ? month : date,
      summary: {
        totalChecksheets,
        filledChecksheets: filledCount,
        pendingChecksheets: pendingCount,
        fillupPercentage,
        totalTeaCount,
        ...teaLitersSummary,
        ...counterSummary,
        ...overtimeSummary,
      },
      teaByDepartment: teaByDept,
      teaRecords,
      submissions,
      checksheets,
      teaDeliveryLogs,
      teaLitersSummary,
      counterLogs,
      counterSummary,
      stockAuditLogs,
      overtimeLogs,
      overtimeSummary,
    });
  } catch (error) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/reports/summary error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
