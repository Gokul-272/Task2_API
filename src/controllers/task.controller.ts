import type { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service.js";
import { AppError } from "../middleware/error.middleware.js";
import type { AuthRequest } from "../types.js";
export const getAllTasks = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const tasksData = await taskService.getAllTasks(req.user.userId as string, page, limit, status);
    res.status(200).json(tasksData);
  } catch (error) {
    next(error);
  }
};
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const id = req.params.id as string;
    const task = await taskService.getTaskById(id, req.user.userId as string);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    const { title, description, status } = req.body;
    if (!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const newTask = await taskService.createTask(title, description, req.user.userId as string, status);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const id = req.params.id as string;
    const { title, description, status } = req.body;
    const updatedTask = await taskService.updateTask(id, req.user.userId as string, title, description, status);
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction,) => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError("User not authenticated", 401);
    }
    const id = req.params.id as string;
    const deletedTask = await taskService.deleteTask(id, req.user.userId as string);
    res.status(200).json(deletedTask);
  } catch (error) {
    next(error);
  }
};
