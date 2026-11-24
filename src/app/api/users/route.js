import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import "@/models";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const createUserSchema = z.object({
  employeeId: z.string().min(2, "Employee ID is required").toUpperCase(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid corporate email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().min(1, "Role is required"),
  departmentId: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
  phoneNumber: z.string().optional().default(""),
});

// GET: Filterable users list
export const GET = requirePermission("manage_users")(async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    const filter = {};
    if (role && role !== "ALL") filter.role = role;
    if (department && department !== "ALL") filter.department = department;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .populate("role", "name code permissions")
      .populate("department", "name code plantLocation")
      .populate("assignedShift", "name code startTime endTime")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST: Create a new user with RBAC protection
export const POST = requirePermission("manage_users")(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const { employeeId, name, email, password, roleId, departmentId, shiftId, phoneNumber } =
      parsed.data;

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this Email or Employee ID already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      employeeId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: roleId,
      department: departmentId || null,
      assignedShift: shiftId || null,
      phoneNumber: phoneNumber || "",
      isActive: true,
    });

    const populated = await User.findById(newUser._id)
      .populate("role")
      .populate("department")
      .populate("assignedShift");

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "USER_CREATED",
      module: "Users",
      targetId: newUser._id.toString(),
      targetType: "User",
      description: `New staff member ${name} (${employeeId}) created by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, user: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
