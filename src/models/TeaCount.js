import mongoose from "mongoose";

const TeaCountSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // Stored as "YYYY-MM-DD" for exact day grouping
      required: [true, "Date string (YYYY-MM-DD) is required"],
      index: true,
    },
    session: {
      type: String,
      enum: ["MORNING", "AFTERNOON", "EVENING", "NIGHT", "SPECIAL"],
      default: "MORNING",
    },
    count: {
      type: Number,
      required: [true, "Tea count is required"],
      min: [0, "Count cannot be negative"],
      default: 0,
    },
    deliveryStatus: {
      type: String,
      enum: ["DELIVERED", "PENDING", "CANCELLED"],
      default: "DELIVERED",
    },
    loggedBy: {
      type: String,
      default: "Canteen Staff",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

TeaCountSchema.index({ date: 1, department: 1, session: 1 });

export default mongoose.models.TeaCount || mongoose.model("TeaCount", TeaCountSchema);
