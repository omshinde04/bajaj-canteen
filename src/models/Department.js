import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      uppercase: true,
      trim: true,
      unique: true,
    },
    plantLocation: {
      type: String,
      required: [true, "Plant / Location is required"],
      trim: true,
      default: "Bajaj Auto Main Facility",
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

DepartmentSchema.index({ isActive: 1 });

export default mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
