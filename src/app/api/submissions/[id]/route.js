import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import "@/models";
import Submission from "@/models/Submission";
import { requirePermission } from "@/lib/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const submission = await Submission.findById(id)
      .populate("checkSheet")
      .populate("department")
      .populate("shift")
      .populate("submittedBy", "name email employeeId role")
      .populate("reviewedBy", "name email employeeId role");

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const DELETE = requirePermission("delete")(async (req, { params, user }) => {
  try {
    await connectDB();
    const { id } = await params;

    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    await recordAuditLog({
      actor: user._id,
      actorEmail: user.email,
      actorName: user.name,
      actorRole: user.role?.code,
      action: "SUBMISSION_DELETED",
      module: "CheckSheets",
      targetId: id,
      targetType: "Submission",
      description: `Submission ${id} deleted by ${user.name}`,
      req,
    });

    return NextResponse.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
