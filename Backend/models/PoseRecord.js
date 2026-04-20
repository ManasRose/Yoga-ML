import mongoose from "mongoose";

const keypointSchema = new mongoose.Schema(
  {
    name: String,
    x: Number,
    y: Number,
    z: Number,
    visibility: Number,
  },
  { _id: false },
);

const correctionSchema = new mongoose.Schema(
  {
    joint: String, // e.g. "left_knee"
    expected: Number, // ideal angle in degrees
    actual: Number,
    message: String, // e.g. "Bend your left knee more — target 90°"
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { _id: false },
);

const poseRecordSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    poseRefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoseReference",
      default: null,
    },
    detectedLabel: { type: String, required: true }, // e.g. "warrior_ii"
    confidenceScore: { type: Number, min: 0, max: 1 },
    overallScore: { type: Number, min: 0, max: 100 },
    keypoints: [keypointSchema],
    corrections: [correctionSchema],
    capturedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

poseRecordSchema.index({ sessionId: 1, capturedAt: 1 });

export default mongoose.model("PoseRecord", poseRecordSchema);
