import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import "@/models";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  roleId: z.string().optional(),
  departmentId: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const PATCH = requirePermission("manage_users")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const updatePayload = { ...parsed.data };
    if (updatePayload.roleId) {
      updatePayload.role = updatePayload.roleId;
      delete updatePayload.roleId;
    }
    if (updatePayload.departmentId !== undefined) {
      updatePayload.department = updatePayload.departmentId;
      delete updatePayload.departmentId;
    }
    if (updatePayload.shiftId !== undefined) {
      updatePayload.assignedShift = updatePayload.shiftId;
      delete updatePayload.shiftId;
    }
    if (updatePayload.password) {
      updatePayload.password = await hashPassword(updatePayload.password);
    }

    const updated = await User.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("role")
      .populate("department")
      .populate("assignedShift");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "USER_UPDATED",
      module: "Users",
      targetId: id,
      targetType: "User",
      description: `User ${updated.name} updated by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = requirePermission("manage_users")(async (req, { params, user }) => {
  try {
    const { id } = await params;
    await connectDB();

    // Toggle active status or soft delete
    const updated = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "USER_DEACTIVATED",
      module: "Users",
      targetId: id,
      targetType: "User",
      description: `User ${updated.name} deactivated by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, message: "User account deactivated" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
