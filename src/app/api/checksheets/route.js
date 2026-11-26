import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import CheckSheet from "@/models/CheckSheet";
import Department from "@/models/Department";
import Shift from "@/models/Shift";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const checkSheetSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  code: z.string().min(2, "Code is required").toUpperCase(),
  category: z.string().min(2, "Category is required"),
  department: z.string().min(1, "Department ID is required"),
  allowedShifts: z.array(z.string()).optional().default([]),
  frequency: z.enum(["per_shift", "daily", "weekly", "monthly"]).default("daily"),
  mandatoryPhotoCount: z.number().min(0).default(0),
  slaHours: z.number().min(1).default(4),
  fields: z
    .array(
      z.object({
        fieldId: z.string(),
        label: z.string(),
        fieldType: z.enum(["text", "number", "select", "checkbox", "date", "time", "photo", "remarks", "boolean"]),
        options: z.array(z.string()).optional().default([]),
        isRequired: z.boolean().default(true),
        requiresPhoto: z.boolean().default(false),
        minValue: z.number().nullable().optional(),
        maxValue: z.number().nullable().optional(),
        unit: z.string().optional().default(""),
        order: z.number().default(0),
      })
    )
    .optional()
    .default([]),
});

// GET: Filterable and paginated check sheets
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const department = searchParams.get("department");
    const category = searchParams.get("category");
    const frequency = searchParams.get("frequency");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const filter = { isDeleted: false, isActive: true };
    if (department) filter.department = department;
    if (category) filter.category = category;
    if (frequency) filter.frequency = frequency;
    if (search && search.trim()) {
      const clean = search.trim();
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const tokens = clean
        .split(/[\s\-_\/]+/)
        .filter(Boolean)
        .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

      const flexibleRegex = tokens.join("[\\s\\-_]+");

      // Build precise matching conditions
      const conditions = [
        { title: { $regex: flexibleRegex, $options: "i" } },
        { code: { $regex: escaped, $options: "i" } },
        { category: { $regex: flexibleRegex, $options: "i" } },
      ];

      // If user typed multiple words, match documents containing all words (with word boundaries)
      if (tokens.length > 1) {
        conditions.push({
          $and: tokens.map((t) => ({
            $or: [
              { title: { $regex: `(^|[^a-zA-Z0-9])${t}`, $options: "i" } },
              { code: { $regex: t, $options: "i" } },
              { category: { $regex: `(^|[^a-zA-Z0-9])${t}`, $options: "i" } },
            ],
          })),
        });
      }

      filter.$or = conditions;
    }

    const [total, checkSheets] = await Promise.all([
      CheckSheet.countDocuments(filter),
      CheckSheet.find(filter)
        .populate("department", "name code plantLocation")
        .populate("allowedShifts", "name code startTime endTime")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
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
      checkSheets,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create new check sheet with RBAC check
export const POST = requirePermission("manage_checksheets")(async (req, { user }) => {
  try {
    const body = await req.json();
    const parsed = checkSheetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();
    const checkSheet = await CheckSheet.create({
      ...parsed.data,
      createdBy: user.id || user._id,
    });

    await recordAuditLog({
      actorId: user.id || user._id,
      actorName: user.name,
      action: "CREATE",
      module: "CheckSheet",
      recordId: checkSheet._id,
      updatedValue: { title: checkSheet.title, code: checkSheet.code },
      req,
    });

    return NextResponse.json({ success: true, checkSheet }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "CheckSheet code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
