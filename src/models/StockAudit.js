import mongoose from "mongoose";

const StockAuditSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      enum: ["parle-g", "good-day", "marie-gold", "monaco", "krackjack"],
      index: true,
    },
    productName: {
      type: String,
      required: true,
      default: "Parle-G",
    },
    openingStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    newAddedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    shift1Consumption: {
      type: Number,
      default: 0,
      min: 0,
    },
    shift2Consumption: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalConsumption: {
      type: Number,
      default: 0,
    },
    closingStock: {
      type: Number,
      default: 0,
    },
    loggedBy: {
      type: String,
      default: "Operator 2",
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

// Index to ensure 1 stock audit entry per product per date
StockAuditSchema.index({ date: 1, productId: 1 }, { unique: true });

StockAuditSchema.pre("save", function () {
  this.totalConsumption = (this.shift1Consumption || 0) + (this.shift2Consumption || 0);
  this.closingStock = (this.openingStock || 0) + (this.newAddedStock || 0) - this.totalConsumption;
});

export default mongoose.models.StockAudit || mongoose.model("StockAudit", StockAuditSchema);
