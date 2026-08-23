import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import mongoose from "mongoose";
import connectDB from "./db/db.js";
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
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
app.get("/health", (req, res) => {
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
