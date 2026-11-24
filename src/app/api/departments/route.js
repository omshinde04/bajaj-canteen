import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Department from "@/models/Department";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  plantLocation: z.string().optional().default("Bajaj Auto Akurdi Facility"),
  description: z.string().optional().default(""),
});

// GET: Cached listing of active departments
export async function GET() {
  try {
    const departments = await cache.remember("master:departments", 1800, async () => {
      await connectDB();
      return Department.find({ isActive: true }).sort({ name: 1 }).lean();
    });

    return NextResponse.json({ success: true, count: departments.length, departments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create department with RBAC protection & cache invalidation
export const POST = requirePermission("manage_departments")(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const department = await Department.create(parsed.data);

    // Invalidate cached departments
    await cache.del("master:departments");

    // Record immutable audit log
    await recordAuditLog({
      actorId: user.id || user._id,
      actorName: user.name,
      action: "CREATE",
      module: "Department",
      recordId: department._id,
      updatedValue: parsed.data,
      req,
    });

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Department code or name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
