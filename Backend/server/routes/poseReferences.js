import { Router } from "express";
import {
  getAllPoses,
  getPoseBySlug,
  createPose,
  updatePose,
} from "../controllers/poseReferenceController.js";

const router = Router();
router.get("/", getAllPoses);
router.get("/:slug", getPoseBySlug);
router.post("/", createPose); // lock this behind admin middleware in prod
router.put("/:slug", updatePose);
export default router;
