import express from "express";
import { info } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/info", authMiddleware, info);

export default router;
