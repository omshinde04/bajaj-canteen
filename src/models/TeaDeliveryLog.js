import mongoose from "mongoose";

const TeaDeliveryLogSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: ["SHIFT_1", "SHIFT_2", "GENERAL"],
      default: "SHIFT_1",
    },
    session: {
      type: String,
      enum: ["MORNING", "EVENING", "NIGHT"],
      default: "MORNING",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    // 1. Delivery Stage: tea kiti lit. thevlay + live photo
    deliveredLiters: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryPhoto: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
    // 2. Return Stage: tea kiti return aalay liter madhe
    returnedLiters: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    // 3. Automated Calculations:
    // Total consumption = deliveredLiters - returnedLiters
    // Total waste = returnedLiters
    consumedLiters: {
      type: Number,
      default: 0,
    },
    wasteLiters: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["DELIVERED", "COMPLETED"],
      default: "DELIVERED",
    },
    loggedBy: {
      type: String,
      default: "Tea Operator",
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

TeaDeliveryLogSchema.pre("save", function () {
  this.consumedLiters = Math.max(0, this.deliveredLiters - (this.returnedLiters || 0));
  this.wasteLiters = this.returnedLiters || 0;
  if (this.returnedLiters !== undefined && this.returnedLiters > 0) {
    this.status = "COMPLETED";
    if (!this.returnedAt) this.returnedAt = new Date();
  }
});

export default mongoose.models.TeaDeliveryLog || mongoose.model("TeaDeliveryLog", TeaDeliveryLogSchema);
