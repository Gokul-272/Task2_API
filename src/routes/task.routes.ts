import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import * as taskController from "../controllers/task.controller.js";
import { validate } from "../utils/validate.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";

const router = Router();

router.get("/", authenticateJWT, taskController.getAllTasks);
router.get("/:id", authenticateJWT, taskController.getTaskById);
router.post("/", authenticateJWT, validate(createTaskSchema), taskController.createTask);
router.put("/:id", authenticateJWT, validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", authenticateJWT, taskController.deleteTask);

export default router;
