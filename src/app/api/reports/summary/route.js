import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CheckSheet from "@/models/CheckSheet";
import Submission from "@/models/Submission";
import TeaCount from "@/models/TeaCount";
import Department from "@/models/Department";

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

    // 3. Tea Count for period
    let teaQuery = {};
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
      },
      teaByDepartment: teaByDept,
      teaRecords,
      submissions,
      checksheets,
    });
  } catch (error) {
    console.error("GET /api/reports/summary error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
