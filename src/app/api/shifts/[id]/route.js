import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import "@/models";
import Shift from "@/models/Shift";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).toUpperCase().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = requirePermission("manage_shifts")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const updated = await Shift.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    await cache.del("master:shifts");

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "SHIFT_UPDATED",
      module: "Shift",
      targetId: id,
      targetType: "Shift",
      description: `Shift ${updated.name} updated by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, shift: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = requirePermission("manage_shifts")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    await connectDB();

    const deleted = await Shift.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    await cache.del("master:shifts");

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "SHIFT_DELETED",
      module: "Shift",
      targetId: id,
      targetType: "Shift",
      description: `Shift ${deleted.name} deleted by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, message: "Shift deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
