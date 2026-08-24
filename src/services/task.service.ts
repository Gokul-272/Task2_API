import type { Task, TaskStatus, PaginatedResponse } from "../types.js";
import { AppError } from "../middleware/error.middleware.js";
import { TaskModel } from "../models/tasks.js";
export const getAllTasks = async (userId: string, page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<Task>> => {
  const query: any = { userId };
  if (status && status !== "all") {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  const [tasks, total] = await Promise.all([
    TaskModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    TaskModel.countDocuments(query)
  ]);

  return {
    data: tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getTaskById = async (id: string, userId: string): Promise<Task> => {
  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

export const createTask = async (title: string, description: string, userId: string, status?: TaskStatus): Promise<Task> => {
  return await TaskModel.create({ title, description, userId, status: status || "todo" });
};

export const updateTask = async (id: string, userId: string, title?: string, description?: string, status?: TaskStatus): Promise<Task> => {
  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new AppError("Task not found to update", 404);
  }
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
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
