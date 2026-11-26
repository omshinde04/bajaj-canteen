import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel"); // NORMAL, WHATSAPP, EMAIL
    const direction = searchParams.get("direction"); // INCOMING, OUTGOING

    const query = {};
    if (channel && channel !== "ALL") query.channel = channel;
    if (direction && direction !== "ALL") query.direction = direction;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const totalCount = await Notification.countDocuments();

    return NextResponse.json({
      success: true,
      unreadCount,
      totalCount,
      notifications,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, message, channel, recipient, priority } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message content are required." },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      title,
      message,
      channel: channel || "NORMAL",
      direction: "OUTGOING",
      recipient: recipient || "All Plant Staff",
      sender: "Canteen Admin Console",
      status: "SENT",
      priority: priority || "NORMAL",
      isRead: true,
    });

    await recordAuditLog({
      action: "NOTIFICATION_DISPATCHED",
      targetId: notification._id.toString(),
      module: "Notifications",
      details: { title, channel, recipient },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: false, error: "ID or markAllRead flag required." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required." }, { status: 400 });
    }

    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Notification deleted." });
  } catch (error) {
    console.error("DELETE /api/notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
