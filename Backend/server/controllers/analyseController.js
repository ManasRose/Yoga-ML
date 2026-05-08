import axios from "axios";

const ML_SERVICE =
  process.env.ML_SERVICE_URL || "https://yoga-ml-service.onrender.com";

// Shared axios instance with timeout so Render cold-starts don't hang forever
const mlAxios = axios.create({ timeout: 25000 }); // 25s

export const analyseFrame = async (req, res) => {
  try {
    const { imageBase64, targetPose } = req.body;
    if (!imageBase64)
      return res.status(400).json({ message: "imageBase64 required" });

    const { data } = await mlAxios.post(`${ML_SERVICE}/predict/frame`, {
      image: imageBase64,
      targetPose: targetPose || null,
    });

    res.json(data);
  } catch (err) {
    const status =
      err.code === "ECONNABORTED" ? 504 : err.response?.status || 502;
    res.status(status).json({
      message:
        status === 504
          ? "ML service timed out (cold start)"
          : "ML service error",
      detail: err.message,
    });
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

    const { data } = await mlAxios.post(`${ML_SERVICE}/predict/upload`, form, {
      headers: form.getHeaders(),
    });

    res.json(data);
  } catch (err) {
    const status =
      err.code === "ECONNABORTED" ? 504 : err.response?.status || 502;
    res.status(status).json({
      message:
        status === 504
          ? "ML service timed out (cold start)"
          : "ML service error",
      detail: err.message,
    });
  }
};
