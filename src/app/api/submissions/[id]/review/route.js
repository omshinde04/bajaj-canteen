import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import "@/models";
import Submission from "@/models/Submission";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "FLAG"]),
  supervisorRemarks: z.string().optional().default(""),
  rejectionReason: z.string().optional().default(""),
});

export const PATCH = requirePermission("approve")(async (req, { params, user }) => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { action, supervisorRemarks, rejectionReason } = parsed.data;

    const submission = await Submission.findById(id).populate("checkSheet");
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (action === "REJECT" && !rejectionReason.trim()) {
      return NextResponse.json(
        { error: "A specific rejection reason is mandatory when rejecting a submission." },
        { status: 400 }
      );
    }

    const now = new Date();
    let newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";
    if (action === "FLAG") newStatus = "FLAGGED";

    // Generate SHA-256 Digital Signature Hash
    const signaturePayload = `${submission._id}:${user._id}:${now.toISOString()}:${newStatus}`;
    const signatureHash = crypto
      .createHash("sha256")
      .update(signaturePayload)
      .digest("hex");

    submission.status = newStatus;
    submission.reviewedBy = user._id;
    submission.reviewedAt = now;
    submission.supervisorRemarks = supervisorRemarks || "";
    submission.rejectionReason = action === "REJECT" ? rejectionReason : null;
    submission.digitalSignature = {
      signedBy: `${user.name} (${user.employeeId || "BAJAJ-SUP"})`,
      timestamp: now,
      hash: signatureHash,
    };

    await submission.save();

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: action === "APPROVE" ? "SUBMISSION_APPROVED" : "SUBMISSION_REJECTED",
      module: "Approvals",
      targetId: submission._id.toString(),
      targetType: "Submission",
      description: `Submission for ${submission.checkSheet?.title || "Check Sheet"} marked as ${newStatus} by ${user.name}`,
      metadata: {
        newStatus,
        supervisorRemarks,
        rejectionReason,
        signatureHash,
      },
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Submission successfully marked as ${newStatus}`,
      submission,
    });
  } catch (error) {
    console.error("Error in review action:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
