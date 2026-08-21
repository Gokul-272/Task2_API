import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).send("Welcome to Task Management API");
});
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use(errorHandler);
export default app;
