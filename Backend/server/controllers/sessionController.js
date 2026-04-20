import Session from "../../models/Session.js";
import PoseRecord from "../../models/PoseRecord.js";

export const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      userId: req.user.id,
      title: req.body.title || "Practice session",
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .sort({ startedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const records = await PoseRecord.find({ sessionId: session._id })
      .sort({ capturedAt: 1 })
      .select("-keypoints"); // keypoints are heavy, omit in list view
    res.json({ session, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Compute overall score from all records in this session
    const records = await PoseRecord.find({ sessionId: session._id });
    const avg = records.length
      ? Math.round(
          records.reduce((s, r) => s + (r.overallScore || 0), 0) /
            records.length,
        )
      : null;

    const now = new Date();
    session.endedAt = now;
    session.durationSecs = Math.round((now - session.startedAt) / 1000);
    session.overallScore = avg;
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
