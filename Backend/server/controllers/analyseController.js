import axios from "axios";

const ML_SERVICE = process.env.ML_SERVICE_URL || "http://localhost:5001";

export const analyseFrame = async (req, res) => {
  try {
    const { imageBase64, targetPose } = req.body;
    if (!imageBase64)
      return res.status(400).json({ message: "imageBase64 required" });

    const { data } = await axios.post(`${ML_SERVICE}/predict/frame`, {
      image: imageBase64,
      targetPose: targetPose || null,
    });

    // data shape: { label, confidence, score, keypoints, corrections }
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res
      .status(status)
      .json({ message: "ML service error", detail: err.message });
  }
};

export const analyseUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    if (req.body.targetPose) form.append("targetPose", req.body.targetPose);

    const { data } = await axios.post(`${ML_SERVICE}/predict/upload`, form, {
      headers: form.getHeaders(),
    });

    res.json(data);
  } catch (err) {
    const status = err.response?.status || 502;
    res
      .status(status)
      .json({ message: "ML service error", detail: err.message });
  }
};
