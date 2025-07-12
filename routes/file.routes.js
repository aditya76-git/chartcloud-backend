import express from "express";
import {
  addChartToFile,
  deleteFile,
  getChartsFromFileId,
  getFile,
  getFilesStats,
  listFiles,
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
router.get("/:id/charts", getChartsFromFileId);

router.post("/:id/charts", authMiddleware, addChartToFile);

router.patch("/:id/sharing", authMiddleware, toggleFileSharing);

export default router;
