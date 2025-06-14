import express from "express";
import {
  login,
  logout,
  signup,
  sendVerificationCode,
  verifyVerificationCode,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { refreshTokenNotBlockedMiddleware } from "../middlewares/blocklist.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post(
  "/refresh",
  authMiddleware,
  refreshTokenNotBlockedMiddleware,
  refreshAccessToken
);
router.patch("/send-verification-code", authMiddleware, sendVerificationCode);
router.patch(
  "/verify-verification-code",
  authMiddleware,
  verifyVerificationCode
);

export default router;
