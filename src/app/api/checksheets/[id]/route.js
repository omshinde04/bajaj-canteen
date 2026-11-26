import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/models";
import CheckSheet from "@/models/CheckSheet";
import Department from "@/models/Department";
import Shift from "@/models/Shift";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const checkSheet = await CheckSheet.findById(id)
      .populate("department", "name code plantLocation")
      .populate("allowedShifts", "name code startTime endTime")
      .lean();

    if (!checkSheet) {
      return NextResponse.json({ success: false, error: "Check sheet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, checkSheet });
  } catch (error) {
    console.error("Error fetching check sheet:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await CheckSheet.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Check sheet not found" }, { status: 404 });
    }

    await recordAuditLog({
      action: "CHECKSHEET_DELETED",
      targetId: id,
      module: "CheckSheet",
      details: { title: deleted.title, code: deleted.code },
    });

    return NextResponse.json({ success: true, message: "Check sheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting check sheet:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updated = await CheckSheet.findByIdAndUpdate(id, body, { returnDocument: "after" });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Check sheet not found" }, { status: 404 });
    }

    await recordAuditLog({
      action: "CHECKSHEET_UPDATED",
      targetId: id,
      module: "CheckSheet",
      details: { title: updated.title, code: updated.code },
    });

    return NextResponse.json({ success: true, checkSheet: updated });
  } catch (error) {
    console.error("Error updating check sheet:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  return PUT(req, { params });
}
