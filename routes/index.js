import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ error: false, message: "API is up and running 🎊" });
});

export default router;
