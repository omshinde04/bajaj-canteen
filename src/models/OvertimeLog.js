import mongoose from "mongoose";

const OvertimeLogSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: ["SHIFT_1", "GENERAL", "SHIFT_2", "SHIFT_3"],
      default: "GENERAL",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentCode: {
      type: String,
      default: "",
    },
    // 2-Hour OT headcount
    twoHourCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // 3-Hour OT headcount
    threeHourCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    loggedBy: {
      type: String,
      default: "Supervisor",
    },
    loggedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

OvertimeLogSchema.pre("save", function () {
  this.totalCount = (Number(this.twoHourCount) || 0) + (Number(this.threeHourCount) || 0);
});

export default mongoose.models.OvertimeLog || mongoose.model("OvertimeLog", OvertimeLogSchema);
