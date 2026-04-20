import PoseReference from "../../models/PoseReference.js";

export const getAllPoses = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const poses = await PoseReference.find(filter).select(
      "-idealKeypoints -jointAngles",
    );
    res.json(poses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPoseBySlug = async (req, res) => {
  try {
    const pose = await PoseReference.findOne({ slug: req.params.slug });
    if (!pose) return res.status(404).json({ message: "Pose not found" });
    res.json(pose);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createPose = async (req, res) => {
  try {
    const pose = await PoseReference.create(req.body);
    res.status(201).json(pose);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePose = async (req, res) => {
  try {
    const pose = await PoseReference.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true, runValidators: true },
    );
    if (!pose) return res.status(404).json({ message: "Pose not found" });
    res.json(pose);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
