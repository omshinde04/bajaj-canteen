import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import "@/models";
import Submission from "@/models/Submission";
import CheckSheet from "@/models/CheckSheet";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const createSubmissionSchema = z.object({
  checkSheetId: z.string().min(1, "Check sheet ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  shiftId: z.string().min(1, "Shift ID is required"),
  responses: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      fieldType: z.string(),
      value: z.any(),
      unit: z.string().optional().default(""),
      isConforming: z.boolean().optional().default(true),
      remarks: z.string().optional().default(""),
    })
  ),
  photos: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string().optional().default(""),
        fieldId: z.string().optional().default(""),
        fileSizeKb: z.number().optional().default(0),
        mimeType: z.string().optional().default("image/jpeg"),
      })
    )
    .optional()
    .default([]),
  notes: z.string().optional().default(""),
});

// GET: Filterable submissions list
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const shift = searchParams.get("shift");
    const checkSheetId = searchParams.get("checkSheetId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const filter = {};
    if (status && status !== "ALL") filter.status = status;
    if (department && department !== "ALL") filter.department = department;
    if (shift && shift !== "ALL") filter.shift = shift;
    if (checkSheetId) filter.checkSheet = checkSheetId;

    const [total, submissions] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .populate("checkSheet", "title code category frequency mandatoryPhotoCount slaHours")
        .populate("department", "name code plantLocation")
        .populate("shift", "name code startTime endTime")
        .populate("submittedBy", "name email employeeId")
        .populate("reviewedBy", "name email employeeId")
        .sort({ submissionDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // Optional text filter on populated checkSheet title or operator name
    let filtered = submissions;
    if (search) {
      const q = search.toLowerCase();
      filtered = submissions.filter(
        (s) =>
          s.checkSheet?.title?.toLowerCase().includes(q) ||
          s.checkSheet?.code?.toLowerCase().includes(q) ||
          s.submittedBy?.name?.toLowerCase().includes(q) ||
          s.submittedBy?.employeeId?.toLowerCase().includes(q)
      );
    }

    // Status counts summary for UI tabs
    const statusCounts = await Submission.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const countsMap = {
      ALL: total,
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      REJECTED: 0,
      FLAGGED: 0,
    };
    statusCounts.forEach((sc) => {
      if (countsMap[sc._id] !== undefined) {
        countsMap[sc._id] = sc.count;
      }
    });

    return NextResponse.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: countsMap,
      submissions: filtered,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new operational check sheet submission
export const POST = requirePermission("add")(async (req, { user }) => {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { checkSheetId, departmentId, shiftId, responses, photos, notes } =
      parsed.data;

    const checkSheet = await CheckSheet.findById(checkSheetId);
    if (!checkSheet) {
      return NextResponse.json(
        { error: "Target CheckSheet not found" },
        { status: 404 }
      );
    }

    // Mandatory Photo Validation
    if (checkSheet.mandatoryPhotoCount > 0 && photos.length < checkSheet.mandatoryPhotoCount) {
      return NextResponse.json(
        {
          error: `This check sheet requires at least ${checkSheet.mandatoryPhotoCount} photograph(s) as digital evidence.`,
        },
        { status: 400 }
      );
    }

    // Calculate SLA target
    const slaHours = checkSheet.slaHours || 4;
    const slaTargetTime = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    // Calculate Compliance Score
    const nonConformingCount = responses.filter((r) => r.isConforming === false).length;
    const totalFields = responses.length || 1;
    const complianceScore = Math.max(
      0,
      Math.round(((totalFields - nonConformingCount) / totalFields) * 100)
    );
    const hasDefects = nonConformingCount > 0;

    const userId = user._id || user.id;

    const submission = await Submission.create({
      checkSheet: checkSheetId,
      department: departmentId,
      shift: shiftId,
      submittedBy: userId,
      responses,
      photos,
      notes,
      complianceScore,
      hasDefects,
      status: "PENDING_APPROVAL",
      slaTargetTime,
      isSlaBreached: false,
      submissionDate: new Date(),
    });

    await recordAuditLog({
      actor: userId,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "SUBMISSION_CREATED",
      module: "CheckSheets",
      targetId: submission._id.toString(),
      targetType: "Submission",
      description: `Submission recorded for ${checkSheet.title} (${checkSheet.code}) by ${user.name}`,
      metadata: {
        complianceScore,
        photosCount: photos.length,
        hasDefects,
      },
      req,
    });

    return NextResponse.json(
      { success: true, submission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
