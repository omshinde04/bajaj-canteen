import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TeaCount from "@/models/TeaCount";
import Department from "@/models/Department";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const month = searchParams.get("month"); // e.g. "2026-11"
    const departmentId = searchParams.get("departmentId");

    const query = {};
    if (month) {
      query.date = { $regex: `^${month}` };
    } else if (date) {
      query.date = date;
    }

    if (departmentId) {
      query.department = departmentId;
    }

    const records = await TeaCount.find(query).sort({ date: -1, session: 1 });

    // Aggregate today's stats
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecords = await TeaCount.find({ date: todayStr });
    const totalCupsToday = todayRecords.reduce((acc, curr) => acc + (curr.count || 0), 0);

    // Group by department for today's summary
    const deptTotalsMap = {};
    todayRecords.forEach((r) => {
      const name = r.departmentName || "General";
      deptTotalsMap[name] = (deptTotalsMap[name] || 0) + (r.count || 0);
    });

    // Also get all departments for fast logging selector
    const departments = await Department.find({ isActive: true }).select("name code").sort({ name: 1 });

    return NextResponse.json({
      success: true,
      date,
      totalCupsToday,
      deptTotals: deptTotalsMap,
      departments,
      records,
    });
  } catch (error) {
    console.error("GET /api/tea-count error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { departmentId, date, session, count, notes, loggedBy } = body;

    if (!departmentId || !date || count === undefined) {
      return NextResponse.json(
        { success: false, error: "Department, date and tea count are required." },
        { status: 400 }
      );
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    // Upsert or create entry
    const entry = await TeaCount.findOneAndUpdate(
      {
        department: departmentId,
        date,
        session: session || "MORNING",
      },
      {
        department: departmentId,
        departmentName: dept.name,
        date,
        session: session || "MORNING",
        count: Number(count),
        notes: notes || "",
        loggedBy: loggedBy || "Canteen Admin",
        deliveryStatus: "DELIVERED",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    await recordAuditLog({
      action: "TEA_COUNT_LOGGED",
      targetId: entry._id.toString(),
      module: "TeaCount",
      details: {
        departmentName: dept.name,
        date,
        session,
        count,
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tea-count error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required." }, { status: 400 });
    }

    await TeaCount.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Tea count record removed." });
  } catch (error) {
    console.error("DELETE /api/tea-count error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
