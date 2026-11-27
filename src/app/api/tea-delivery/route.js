import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TeaDeliveryLog from "@/models/TeaDeliveryLog";
import Department from "@/models/Department";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const shift = searchParams.get("shift");

    const filter = { date };
    if (shift) filter.shift = shift;

    const [logs, departments] = await Promise.all([
      TeaDeliveryLog.find(filter).populate("department", "name code plantLocation").sort({ createdAt: -1 }).lean(),
      Department.find({ isActive: true }).select("name code plantLocation").lean(),
    ]);

    // Calculate totals & department-wise breakdown
    let totalDeliveredLiters = 0;
    let totalReturnedLiters = 0;
    let totalConsumedLiters = 0;
    let totalWasteLiters = 0;

    const deptBreakdown = {};

    logs.forEach((log) => {
      totalDeliveredLiters += log.deliveredLiters || 0;
      totalReturnedLiters += log.returnedLiters || 0;
      totalConsumedLiters += log.consumedLiters || 0;
      totalWasteLiters += log.wasteLiters || 0;

      const dName = log.departmentName || log.department?.name || "Other";
      if (!deptBreakdown[dName]) {
        deptBreakdown[dName] = {
          delivered: 0,
          returned: 0,
          consumed: 0,
          waste: 0,
          records: 0,
        };
      }
      deptBreakdown[dName].delivered += log.deliveredLiters || 0;
      deptBreakdown[dName].returned += log.returnedLiters || 0;
      deptBreakdown[dName].consumed += log.consumedLiters || 0;
      deptBreakdown[dName].waste += log.wasteLiters || 0;
      deptBreakdown[dName].records += 1;
    });

    return NextResponse.json({
      success: true,
      date,
      summary: {
        totalDeliveredLiters,
        totalReturnedLiters,
        totalConsumedLiters,
        totalWasteLiters,
        totalDepartmentsServed: Object.keys(deptBreakdown).length,
      },
      deptBreakdown,
      logs,
      departments,
    });
  } catch (error) {
    console.error("GET /api/tea-delivery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 1. Deliver Tea (Stage 1)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      date,
      shift,
      session,
      departmentId,
      deliveredLiters,
      deliveryPhoto,
      loggedBy,
      notes,
    } = body;

    if (!departmentId || deliveredLiters === undefined) {
      return NextResponse.json(
        { error: "Department and delivered liters are required" },
        { status: 400 }
      );
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const logDate = date || new Date().toISOString().split("T")[0];
    const delivered = Number(deliveredLiters) || 0;

    const newLog = await TeaDeliveryLog.create({
      date: logDate,
      shift: shift || "SHIFT_1",
      session: session || "MORNING",
      department: dept._id,
      departmentName: dept.name,
      deliveredLiters: delivered,
      deliveryPhoto: deliveryPhoto || "",
      deliveredAt: new Date(),
      returnedLiters: 0,
      consumedLiters: delivered,
      wasteLiters: 0,
      status: "DELIVERED",
      loggedBy: loggedBy || "Tea Operator",
      notes: notes || "",
    });

    return NextResponse.json({
      success: true,
      message: "Tea delivery logged successfully",
      log: newLog,
    });
  } catch (error) {
    console.error("POST /api/tea-delivery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Return Tea (Stage 2)
export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { logId, returnedLiters, notes } = body;

    if (!logId || returnedLiters === undefined) {
      return NextResponse.json(
        { error: "Log ID and returned liters are required" },
        { status: 400 }
      );
    }

    const existingLog = await TeaDeliveryLog.findById(logId);
    if (!existingLog) {
      return NextResponse.json({ error: "Delivery log record not found" }, { status: 404 });
    }

    const retLiters = Math.max(0, Number(returnedLiters) || 0);
    existingLog.returnedLiters = retLiters;
    existingLog.returnedAt = new Date();
    existingLog.consumedLiters = Math.max(0, existingLog.deliveredLiters - retLiters);
    existingLog.wasteLiters = retLiters;
    existingLog.status = "COMPLETED";
    if (notes) existingLog.notes = notes;

    await existingLog.save();

    return NextResponse.json({
      success: true,
      message: "Tea return & waste calculated successfully",
      log: existingLog,
    });
  } catch (error) {
    console.error("PATCH /api/tea-delivery error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
