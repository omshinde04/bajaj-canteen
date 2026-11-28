import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CounterLog from "@/models/CounterLog";
import Notification from "@/models/Notification";


export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const shift = searchParams.get("shift"); // "SHIFT_1_GEN", "SHIFT_2", "VIP"

    const filter = { date };
    if (shift) filter.shift = shift;

    const logs = await CounterLog.find(filter).sort({ createdAt: -1 }).lean();

    // Summary calculation
    const summary = {
      totalPlates: logs.reduce((acc, curr) => acc + (curr.totalPlates || 0), 0),
      consumedPlates: logs.reduce((acc, curr) => acc + (curr.consumedPlates || 0), 0),
      balancePlates: logs.reduce((acc, curr) => acc + (curr.balancePlates || 0), 0),
      allCountersReady: logs.length > 0 && logs.every((l) => l.isReady),
    };

    return NextResponse.json({
      success: true,
      date,
      shift,
      summary,
      logs,
    });
  } catch (error) {
    console.error("GET /api/counter-logs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      date,
      shift,
      mealType,
      isReady,
      openingPhoto,
      closingPhoto,
      photos,
      totalPlates,
      consumedPlates,
      subShiftBreakdown,
      loggedBy,
      notes,
    } = body;

    if (!date || !shift || !mealType) {
      return NextResponse.json(
        { error: "Date, Shift, and Meal Type are required" },
        { status: 400 }
      );
    }

    const total = Number(totalPlates) || 0;
    const consumed = Number(consumedPlates) || 0;
    const balance = Math.max(0, total - consumed);

    const log = await CounterLog.findOneAndUpdate(
      { date, shift, mealType },
      {
        date,
        shift,
        mealType,
        isReady: isReady !== undefined ? isReady : true,
        openingPhoto: openingPhoto || "",
        closingPhoto: closingPhoto || "",
        photos: photos || [],
        totalPlates: total,
        consumedPlates: consumed,
        balancePlates: balance,
        subShiftBreakdown: subShiftBreakdown || { shift1Count: 0, generalCount: 0 },
        loggedBy: loggedBy || "Operator 1",
        notes: notes || "",
      },
      { upsert: true, returnDocument: "after" }
    );

    // Auto-dispatch in-app notification to Admin
    try {
      const mealTitle = mealType ? mealType.replace(/_/g, " ") : "Counter";
      await Notification.create({
        title: `Counter Audit: ${mealTitle} (${shift})`,
        message: `${total} plates prepared, ${consumed} consumed, balance ${balance}. Readiness: ${isReady ? "READY" : "IN PROGRESS"}.`,
        channel: "NORMAL",
        direction: "INCOMING",
        sender: loggedBy || "Operator 1",
        recipient: "Admin Console",
        priority: "NORMAL",
        status: "RECEIVED",
        isRead: false,
        link: "/admin/reports",
      });
    } catch (notifErr) {
      console.warn("Failed to create in-app notification for counter log:", notifErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Counter log saved successfully",
      log,
    });
  } catch (error) {
    console.error("POST /api/counter-logs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
