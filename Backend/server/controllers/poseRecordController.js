import PoseRecord from "../../models/PoseRecord.js";
import Session from "../../models/Session.js";

export const createRecord = async (req, res) => {
  try {
    const {
      sessionId,
      detectedLabel,
      confidenceScore,
      overallScore,
      keypoints,
      corrections,
      poseRefId,
    } = req.body;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id,
    });
    if (!session)
      return res
        .status(403)
        .json({ message: "Session not found or unauthorized" });

    const record = await PoseRecord.create({
      sessionId,
      poseRefId,
      detectedLabel,
      confidenceScore,
      overallScore,
      keypoints,
      corrections,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecords = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id,
    });
    if (!session) return res.status(403).json({ message: "Unauthorized" });

    const records = await PoseRecord.find({ sessionId })
      .sort({ capturedAt: 1 })
      .select("-keypoints");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecord = async (req, res) => {
  try {
    const record = await PoseRecord.findById(req.params.id).populate(
      "poseRefId",
      "displayName slug imageUrl",
    );
    if (!record) return res.status(404).json({ message: "Not found" });

    // Verify ownership via session
    const session = await Session.findOne({
      _id: record.sessionId,
      userId: req.user.id,
    });
    if (!session) return res.status(403).json({ message: "Unauthorized" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyStats = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).select("_id");
    const sessionIds = sessions.map((s) => s._id);

    const stats = await PoseRecord.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      {
        $group: {
          _id: "$detectedLabel",
          count: { $sum: 1 },
          avgScore: { $avg: "$overallScore" },
          avgConfidence: { $avg: "$confidenceScore" },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const record = await PoseRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Not found" });
    const session = await Session.findOne({
      _id: record.sessionId,
      userId: req.user.id,
    });
    if (!session) return res.status(403).json({ message: "Unauthorized" });
    await record.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
