import express from "express";
import cors from "cors";
import { connectDB } from "../models/db.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import poseRecordRoutes from "./routes/poseRecords.js";
import poseReferenceRoutes from "./routes/poseReferences.js";
import analyseRoutes from "./routes/analyse.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/records", poseRecordRoutes);
app.use("/api/poses", poseReferenceRoutes);
app.use("/api/analyse", analyseRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
