import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import fileRoutes from "./routes/file.routes.js";

import fs from "fs";
import path from "path";

dotenv.config();

const setupUploadsFolder = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ 'uploads/' directory created.");
  } else {
    console.log("📂 'uploads/' directory exists.");
  }
};

setupUploadsFolder();

const app = express();
app.use(express.json());
app.use(cors());

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ success: false, message: "File size should not exceed 100KB" });
  }
  next(err);
});

// app.use(cors({
//   origin: ['https://yourfrontend.com', 'https://admin.yourfrontend.com'],
// }));

// Database connect
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

// index route
app.get("/", (req, res) => {
  res.status(200).json({ error: false, message: "API is up and running 🎊" });
});

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/files", fileRoutes);

export default app;
