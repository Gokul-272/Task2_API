import type { Task } from "../types.js";
import { AppError } from "../middleware/error.middleware.js";
import { TaskModel } from "../models/tasks.js";
export const getAllTasks = async (userId: string): Promise<Task[]> => {
  return await TaskModel.find({ userId });
};

export const getTaskById = async (id: string, userId: string): Promise<Task> => {
  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

export const createTask = async (title: string, description: string, userId: string): Promise<Task> => {
  return await TaskModel.create({ title, description, userId });
};

export const updateTask = async (id: string, userId: string, title?: string, description?: string,): Promise<Task> => {
  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new AppError("Task not found to update", 404);
  }
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  await task.save();
  return task;
};

export const deleteTask = async (id: string, userId: string): Promise<Task> => {
  const task = await TaskModel.findOneAndDelete({ _id: id, userId });
  if (!task) {
    throw new AppError("Task not found to delete", 404);
  }
  return task;
};
