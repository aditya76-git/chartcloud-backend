import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();
app.use(express.json());

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

export default app;
