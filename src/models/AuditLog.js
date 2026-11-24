import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorName: {
      type: String,
      required: true,
      default: "System",
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "LOGIN_FAILED",
        "CREATE",
        "UPDATE",
        "DELETE",
        "APPROVE",
        "REJECT",
        "RESUBMIT",
        "UPLOAD_PHOTO",
        "DOWNLOAD_REPORT",
        "RESTORE",
        "SECURITY_ALERT",
        "SUBMISSION_CREATED",
        "SUBMISSION_APPROVED",
        "SUBMISSION_REJECTED",
        "SUBMISSION_FLAGGED",
      ],
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    recordId: {
      type: String,
      default: null,
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    updatedValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: cannot be updated
  }
);

// High-speed compound indexes for audit filtering
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, action: 1 });
AuditLogSchema.index({ recordId: 1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
