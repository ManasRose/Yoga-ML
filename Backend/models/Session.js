import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "Practice session" },
    durationSecs: { type: Number, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, startedAt: -1 });

export default mongoose.model("Session", sessionSchema);
