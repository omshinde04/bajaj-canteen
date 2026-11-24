import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import "@/models";
import Department from "@/models/Department";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).toUpperCase().optional(),
  plantLocation: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = requirePermission("manage_departments")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const updated = await Department.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    await cache.del("master:departments");

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "DEPARTMENT_UPDATED",
      module: "Department",
      targetId: id,
      targetType: "Department",
      description: `Department ${updated.name} updated by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, department: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = requirePermission("manage_departments")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    await connectDB();

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    await cache.del("master:departments");

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "DEPARTMENT_DELETED",
      module: "Department",
      targetId: id,
      targetType: "Department",
      description: `Department ${deleted.name} removed by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, message: "Department deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
