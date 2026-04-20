import { Router } from "express";
import {
  createRecord,
  getRecords,
  getRecord,
  getMyStats,
  deleteRecord,
} from "../controllers/poseRecordController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post("/", createRecord);
router.get("/", getRecords);
router.get("/stats/me", getMyStats);
router.get("/:id", getRecord);
router.delete("/:id", deleteRecord);
export default router;
