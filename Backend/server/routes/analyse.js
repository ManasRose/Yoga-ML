import { Router } from "express";
import multer from "multer";
import {
  analyseFrame,
  analyseUpload,
} from "../controllers/analyseController.js";
import { protect } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();
router.use(protect);
router.post("/frame", analyseFrame);
router.post("/upload", upload.single("file"), analyseUpload);
export default router;
