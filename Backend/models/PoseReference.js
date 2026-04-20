import mongoose from "mongoose";

const jointAngleSchema = new mongoose.Schema(
  {
    joint: String, // e.g. "left_knee"
    minAngle: Number,
    maxAngle: Number, // acceptable range in degrees
  },
  { _id: false },
);

const poseReferenceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // "warrior_ii"
    displayName: { type: String, required: true }, // "Warrior II"
    category: {
      type: String,
      enum: ["standing", "seated", "balance", "supine", "inversion"],
    },
    description: { type: String },
    idealKeypoints: { type: [[Number]], default: [] }, // 33×3 array from MediaPipe
    jointAngles: [jointAngleSchema],
    imageUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("PoseReference", poseReferenceSchema);
