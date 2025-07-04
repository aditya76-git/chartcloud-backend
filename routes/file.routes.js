import express from "express";
import {
  listFiles,
  getFile,
  deleteFile,
  getFilesStats,
  toggleFileSharing,
  uploadFile,
} from "../controllers/file.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

router.get("/", authMiddleware, listFiles);
router.get("/stats", authMiddleware, getFilesStats);

router.get("/:id", authMiddleware, getFile);
router.delete("/:id", authMiddleware, deleteFile);

router.patch("/:id/sharing", authMiddleware, toggleFileSharing);

export default router;
