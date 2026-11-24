import mongoose from "mongoose";

const ShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shift name is required"], // e.g. Shift A
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Shift code is required"], // e.g. SHIFT_A
      uppercase: true,
      trim: true,
      unique: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time (HH:MM) is required"], // e.g. "06:00"
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"],
    },
    endTime: {
      type: String,
      required: [true, "End time (HH:MM) is required"], // e.g. "14:00"
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"],
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ShiftSchema.index({ isActive: 1 });

export default mongoose.models.Shift || mongoose.model("Shift", ShiftSchema);
