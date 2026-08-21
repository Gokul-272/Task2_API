import type { Task } from "../types.ts";
import { AppError } from "../middleware/error.middleware.js";
import { TaskModel } from "../models/tasks.js";
export const getAllTasks = async (): Promise<Task[]> => {
  return await TaskModel.find();
};

export const getTaskById = async (id: string): Promise<Task> => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

export const createTask = async (title: string,description: string,userId: string): Promise<Task> => {
  return await TaskModel.create({title,description,userId});
};
   
export const updateTask = async (id: string, title?: string, description?: string,): Promise<Task> => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  await task.save();
  return task;
};

export const deleteTask = async (id: string): Promise<Task> => {
  const task = await TaskModel.findByIdAndDelete(id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};
