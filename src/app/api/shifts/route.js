import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Shift from "@/models/Shift";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

const shiftSchema = z.object({
  name: z.string().min(2, "Shift name is required"),
  code: z.string().min(2, "Shift code is required").toUpperCase(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM"),
  description: z.string().optional().default(""),
});

// GET: Cached listing of active shifts
export async function GET() {
  try {
    const shifts = await cache.remember("master:shifts", 1800, async () => {
      await connectDB();
      return Shift.find({ isActive: true }).sort({ startTime: 1 }).lean();
    });

    return NextResponse.json({ success: true, count: shifts.length, shifts });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create shift with RBAC protection & cache invalidation
export const POST = requirePermission("manage_shifts")(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = shiftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const shift = await Shift.create(parsed.data);

    // Invalidate cached shifts
    await cache.del("master:shifts");

    await recordAuditLog({
      actorId: user.id || user._id,
      actorName: user.name,
      action: "CREATE",
      module: "Shift",
      recordId: shift._id,
      updatedValue: parsed.data,
      req,
    });

    return NextResponse.json({ success: true, shift }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Shift code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
