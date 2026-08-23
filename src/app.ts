import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import mongoose from "mongoose";
const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.get("/health", (req, res) => {
  console.log("🔥 HEALTH ROUTE HIT");
  console.log("mongodb_url exists:", !!process.env.mongodb_url);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("MongoDB state:", mongoose.connection.readyState);

  res.status(200).json({
    message: "Welcome to Task Management API",
    mongoUrlExists: !!process.env.mongodb_url,
    mongoState: mongoose.connection.readyState,
    nodeEnv: process.env.NODE_ENV,
  });
});
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use(errorHandler);
export default app;
