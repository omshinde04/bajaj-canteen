import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/models";
import Role from "@/models/Role";

export async function GET() {
  try {
    await connectDB();
    const roles = await Role.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, count: roles.length, roles });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
