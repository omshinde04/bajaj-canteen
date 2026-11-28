import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OvertimeLog from "@/models/OvertimeLog";
import Department from "@/models/Department";
import User from "@/models/User";
import Notification from "@/models/Notification";

function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const token = req.cookies.get("bajaj_token")?.value;
    const payload = token ? decodeJwt(token) : null;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const shift = searchParams.get("shift"); // optional: "GENERAL", "SHIFT_1", "SHIFT_2", "SHIFT_3"
    let departmentId = searchParams.get("departmentId");

    // Fetch user details if authenticated
    let currentUser = null;
    if (payload?.userId) {
      currentUser = await User.findById(payload.userId).populate("role department").lean();
    }

    const isOTSupervisor = currentUser?.role?.code === "OT_SUPERVISOR";

    // If OT Supervisor, strictly force their department
    if (isOTSupervisor && currentUser?.department) {
      departmentId = currentUser.department._id.toString();
    }

    // Production departments list
    const deptCodes = [
      "DEPT_ENG_ASSY",
      "DEPT_VEH_ASSY",
      "DEPT_MACHINE_SHOP",
      "DEPT_PAINT_SHOP",
      "DEPT_PRESS_SHOP",
      "DEPT_QA",
    ];

    const departments = await Department.find({
      $or: [{ code: { $in: deptCodes } }, { isActive: true }],
    })
      .sort({ name: 1 })
      .lean();

    // Query filter for OvertimeLog
    const query = { date };
    if (shift && shift !== "ALL") {
      query.shift = shift;
    }
    if (departmentId) {
      query.department = departmentId;
    }

    const logs = await OvertimeLog.find(query)
      .populate("department")
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate aggregated metrics
    const totalTwoHour = logs.reduce((sum, l) => sum + (Number(l.twoHourCount) || 0), 0);
    const totalThreeHour = logs.reduce((sum, l) => sum + (Number(l.threeHourCount) || 0), 0);
    const grandTotal = totalTwoHour + totalThreeHour;

    const distinctDeptsLogged = new Set(logs.map((l) => l.department?._id?.toString() || l.department?.toString())).size;

    return NextResponse.json({
      success: true,
      date,
      shift: shift || "ALL",
      logs,
      summary: {
        totalTwoHour,
        totalThreeHour,
        grandTotal,
        departmentsLogged: distinctDeptsLogged,
        totalDepartments: departments.length || 6,
      },
      departments,
      currentUserDepartment: currentUser?.department || null,
      isOTSupervisor,
    });
  } catch (error) {
    console.error("GET /api/overtime error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get("bajaj_token")?.value;
    const payload = token ? decodeJwt(token) : null;

    let currentUser = null;
    if (payload?.userId) {
      currentUser = await User.findById(payload.userId).populate("role department").lean();
    }

    const isOTSupervisor = currentUser?.role?.code === "OT_SUPERVISOR";
    const body = await req.json();

    const {
      date,
      shift = "GENERAL",
      departmentId,
      twoHourCount = 0,
      threeHourCount = 0,
      notes = "",
    } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Disallow future date logging
    const todayStr = new Date().toISOString().split("T")[0];
    if (date > todayStr) {
      return NextResponse.json(
        { error: `Cannot log overtime for future date (${date}). Maximum allowable date is today (${todayStr}).` },
        { status: 400 }
      );
    }

    // Determine target department
    let finalDeptId = departmentId;
    if (isOTSupervisor) {
      if (!currentUser?.department) {
        return NextResponse.json(
          { error: "User does not have an assigned department" },
          { status: 403 }
        );
      }
      finalDeptId = currentUser.department._id.toString();
    }

    if (!finalDeptId) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    const deptDoc = await Department.findById(finalDeptId).lean();
    if (!deptDoc) {
      return NextResponse.json({ error: "Invalid Department ID" }, { status: 404 });
    }

    const parsed2hr = Math.max(0, Number(twoHourCount) || 0);
    const parsed3hr = Math.max(0, Number(threeHourCount) || 0);
    const parsedTotal = parsed2hr + parsed3hr;

    const loggedByName = currentUser?.name || "OT Supervisor";
    const loggedByUserId = currentUser?._id || null;

    const updatedLog = await OvertimeLog.findOneAndUpdate(
      { date, shift, department: finalDeptId },
      {
        date,
        shift,
        department: finalDeptId,
        departmentName: deptDoc.name,
        departmentCode: deptDoc.code || "",
        twoHourCount: parsed2hr,
        threeHourCount: parsed3hr,
        totalCount: parsedTotal,
        loggedBy: loggedByName,
        loggedByUserId,
        notes: notes || "",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    // Auto-create in-app Notification for Admin & Canteen Hub
    try {
      await Notification.create({
        title: `Overtime Logged: ${deptDoc.name}`,
        message: `${loggedByName} submitted ${parsedTotal} OT workers for ${date} (${shift}): ${parsed2hr} (2-Hour OT), ${parsed3hr} (3-Hour OT).`,
        channel: "NORMAL",
        direction: "INCOMING",
        sender: loggedByName,
        recipient: "Admin & Canteen In-charge",
        priority: "NORMAL",
        status: "RECEIVED",
        isRead: false,
        link: "/admin/dashboard",
      });
    } catch (notifErr) {
      console.warn("Overtime notification error:", notifErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Overtime record for ${deptDoc.name} saved successfully`,
      log: updatedLog,
    });
  } catch (error) {
    console.error("POST /api/overtime error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
