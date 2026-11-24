import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/models";
import CheckSheet from "@/models/CheckSheet";
import Department from "@/models/Department";
import Shift from "@/models/Shift";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const checkSheet = await CheckSheet.findById(id)
      .populate("department", "name code plantLocation")
      .populate("allowedShifts", "name code startTime endTime")
      .lean();

    if (!checkSheet || checkSheet.isDeleted) {
      return NextResponse.json({ error: "Check sheet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, checkSheet });
  } catch (error) {
    console.error("Error fetching check sheet:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
