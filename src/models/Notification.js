import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification content is required"],
      trim: true,
    },
    channel: {
      type: String,
      enum: ["NORMAL", "WHATSAPP", "EMAIL"],
      default: "NORMAL",
    },
    direction: {
      type: String,
      enum: ["INCOMING", "OUTGOING"],
      default: "OUTGOING",
    },
    sender: {
      type: String,
      default: "Canteen Admin",
    },
    recipient: {
      type: String,
      required: true,
      default: "All Staff",
    },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "RECEIVED", "FAILED"],
      default: "SENT",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
      default: "NORMAL",
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ channel: 1, direction: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
