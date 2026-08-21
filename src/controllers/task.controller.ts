import type { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service.js";
import { AppError } from "../middleware/error.middleware.js";
import type { AuthRequest } from "../types.js";
export const getAllTasks = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const id = req.params.id as string;
    const task = await taskService.getTaskById(id);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const { title, description } = req.body;
    if (!title || typeof title !== "string") {
      throw new AppError("Title is required and must be a string", 400);
    }
    if (!description || typeof description !== "string") {
      throw new AppError("Description is required and must be a string", 400);
    }
    if(!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const newTask = await taskService.createTask(title, description, req.user.userId as string);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const id = req.params.id as string;
    const { title, description } = req.body;
    if (title !== undefined && typeof title !== "string") {
      throw new AppError("Title must be a string", 400);
    }
    if (description !== undefined && typeof description !== "string") {
      throw new AppError("Description must be a string", 400);
    }
    const updatedTask = await taskService.updateTask(id, title, description);
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const id = req.params.id as string;
    const deletedTask = await taskService.deleteTask(id);
    res.status(200).json(deletedTask);
  } catch (error) {
    next(error);
  }
};
