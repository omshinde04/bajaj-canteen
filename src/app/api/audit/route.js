import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/models";
import AuditLog from "@/models/AuditLog";
import { requirePermission } from "@/lib/rbac";

export const GET = requirePermission("view_audit_trail")(async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const moduleName = searchParams.get("module");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const filter = {};
    if (action && action !== "ALL") filter.action = action;
    if (moduleName && moduleName !== "ALL") filter.module = moduleName;

    if (search) {
      filter.$or = [
        { actorName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
      ];
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      logs,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
