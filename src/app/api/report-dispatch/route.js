import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ReportRecipient from "@/models/ReportRecipient";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    await connectDB();
    const recipients = await ReportRecipient.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, recipients });
  } catch (error) {
    console.error("GET /api/report-dispatch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, whatsapp, frequency, departmentName, sendDailyReport, sendMonthlyReport } = body;

    if (!name || !email || !whatsapp) {
      return NextResponse.json(
        { success: false, error: "Name, email and WhatsApp phone number are required." },
        { status: 400 }
      );
    }

    const recipient = await ReportRecipient.create({
      name,
      email: email.toLowerCase().trim(),
      whatsapp: whatsapp.trim(),
      frequency: frequency || "BOTH",
      departmentName: departmentName || "All Departments",
      sendDailyReport: sendDailyReport !== false,
      sendMonthlyReport: sendMonthlyReport !== false,
      isActive: true,
    });

    await recordAuditLog({
      action: "RECIPIENT_ADDED",
      targetId: recipient._id.toString(),
      module: "ReportDispatch",
      details: { name, email, whatsapp },
    });

    return NextResponse.json({ success: true, recipient }, { status: 201 });
  } catch (error) {
    console.error("POST /api/report-dispatch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, email, whatsapp, frequency, departmentName, isActive, sendDailyReport, sendMonthlyReport } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Recipient ID is required." }, { status: 400 });
    }

    const updated = await ReportRecipient.findByIdAndUpdate(
      id,
      {
        name,
        email: email?.toLowerCase().trim(),
        whatsapp: whatsapp?.trim(),
        frequency,
        departmentName,
        isActive,
        sendDailyReport,
        sendMonthlyReport,
      },
      { returnDocument: "after" }
    );

    return NextResponse.json({ success: true, recipient: updated });
  } catch (error) {
    console.error("PUT /api/report-dispatch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Recipient ID is required." }, { status: 400 });
    }

    await ReportRecipient.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Recipient deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/report-dispatch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
