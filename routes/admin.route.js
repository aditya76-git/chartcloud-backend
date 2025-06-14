import express from "express";
import {
  deleteUser,
  getUser,
  listUsers,
} from "../controllers/admin.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

// /admin
const router = express.Router();

router.get("/users", adminMiddleware, listUsers);
router.delete("/users/:id", adminMiddleware, deleteUser);
router.get("/users/:id", adminMiddleware, getUser);

export default router;
