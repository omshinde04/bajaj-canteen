import mongoose from "mongoose";

const CheckSheetFieldSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "checkbox", "date", "time", "photo", "remarks", "boolean"],
      default: "text",
    },
    options: [String], // For dropdown / select
    isRequired: {
      type: Boolean,
      default: true,
    },
    requiresPhoto: {
      type: Boolean,
      default: false,
    },
    minValue: {
      type: Number,
      default: null,
    },
    maxValue: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: "", // e.g. "°C", "psi", "kg"
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const CheckSheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Check Sheet title is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Check Sheet code is required"],
      uppercase: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "General Operations",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    allowedShifts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift",
      },
    ],
    frequency: {
      type: String,
      required: true,
      enum: ["per_shift", "daily", "weekly", "monthly"],
      default: "daily",
    },
    mandatoryPhotoCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    slaHours: {
      type: Number,
      default: 4, // Completion SLA in hours
    },
    fields: [CheckSheetFieldSchema],
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete for Recycle Bin
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

CheckSheetSchema.index({ department: 1, isActive: 1 });
CheckSheetSchema.index({ category: 1 });
CheckSheetSchema.index({ isDeleted: 1 });

export default mongoose.models.CheckSheet || mongoose.model("CheckSheet", CheckSheetSchema);
