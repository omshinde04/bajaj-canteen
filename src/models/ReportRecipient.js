import mongoose from "mongoose";

const ReportRecipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp phone number is required"],
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["DAILY", "MONTHLY", "BOTH"],
      default: "BOTH",
    },
    sendDailyReport: {
      type: Boolean,
      default: true,
    },
    sendMonthlyReport: {
      type: Boolean,
      default: true,
    },
    departmentName: {
      type: String,
      default: "All Departments",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ReportRecipientSchema.index({ isActive: 1, email: 1 });

export default mongoose.models.ReportRecipient || mongoose.model("ReportRecipient", ReportRecipientSchema);
