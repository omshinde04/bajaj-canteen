import mongoose from "mongoose";

const ResponseFieldSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    fieldType: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    unit: { type: String, default: "" },
    isConforming: { type: Boolean, default: true },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

const PhotoEvidenceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "" },
    fieldId: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
    fileSizeKb: { type: Number, default: 0 },
    mimeType: { type: String, default: "image/jpeg" },
  },
  { _id: true }
);

const SubmissionSchema = new mongoose.Schema(
  {
    checkSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CheckSheet",
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    responses: [ResponseFieldSchema],
    photos: [PhotoEvidenceSchema],
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "RESUBMITTED",
        "FLAGGED",
        "ARCHIVED",
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    hasDefects: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
    // Review and Sign-off details
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    supervisorRemarks: {
      type: String,
      default: "",
    },
    digitalSignature: {
      signedBy: { type: String, default: null },
      timestamp: { type: Date, default: null },
      hash: { type: String, default: null },
    },
    slaTargetTime: {
      type: Date,
      default: null,
    },
    isSlaBreached: {
      type: Boolean,
      default: false,
      index: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ department: 1, shift: 1, status: 1 });
SubmissionSchema.index({ submissionDate: -1 });

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);

export default Submission;
