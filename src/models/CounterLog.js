import mongoose from "mongoose";

const CounterLogSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    shift: {
      type: String,
      enum: ["SHIFT_1", "GENERAL", "SHIFT_1_GEN", "SHIFT_2", "SHIFT_3", "VIP"],
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"],
      required: true,
      index: true,
    },
    isReady: {
      type: Boolean,
      default: true,
    },
    // Opening & Closing Live Photo Proof
    openingPhoto: {
      type: String,
      default: "",
    },
    closingPhoto: {
      type: String,
      default: "",
    },
    photos: [
      {
        url: { type: String, required: true },
        subShift: { type: String, default: "STANDARD" },
        caption: { type: String, default: "" },
        capturedAt: { type: Date, default: Date.now },
      },
    ],
    // Plate counts: Prepared / Total vs Consumed
    totalPlates: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    consumedPlates: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balancePlates: {
      type: Number,
      default: 0,
    },
    subShiftBreakdown: {
      shift1Count: { type: Number, default: 0 },
      generalCount: { type: Number, default: 0 },
    },
    loggedBy: {
      type: String,
      default: "Operator 1",
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

CounterLogSchema.pre("save", function () {
  this.balancePlates = Math.max(0, this.totalPlates - this.consumedPlates);
});

if (mongoose.models && mongoose.models.CounterLog) {
  delete mongoose.models.CounterLog;
}

export default mongoose.model("CounterLog", CounterLogSchema);
