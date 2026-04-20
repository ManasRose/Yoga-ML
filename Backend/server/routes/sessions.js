import { Router } from "express";
import {
  createSession,
  getSessions,
  getSession,
  endSession,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSession);
router.patch("/:id/end", endSession);
export default router;
