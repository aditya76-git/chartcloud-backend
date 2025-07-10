import express from "express";
import {
  listCharts,
  getChart,
  deleteChart,
} from "../controllers/chart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, listCharts);
router.get("/:id", authMiddleware, getChart);
router.delete("/:id", authMiddleware, deleteChart);

export default router;
