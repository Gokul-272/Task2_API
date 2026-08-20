import { readData, writeData } from "../utils/json.utils.js";
import type { Task } from "../types.ts";
import { AppError } from "../middleware/error.middleware.js";

export const getAllTasks = async (): Promise<Task[]> => {
  return await readData<Task>("tasks.json");
};

export const getTaskById = async (id: string): Promise<Task> => {
  const tasks = await readData<Task>("tasks.json");
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

export const createTask = async (title: string, description: string,): Promise<Task> => {
  const tasks = await readData<Task>("tasks.json");
  const newTask: Task = {
    id: (tasks.length + 1).toString(),
    title,
    description,
  };
  tasks.push(newTask);
  await writeData<Task>("tasks.json", tasks);
  return newTask;
};

export const updateTask = async (id: string, title?: string, description?: string,): Promise<Task> => {
  const tasks = await readData<Task>("tasks.json");
  const task = tasks.find((task) => task.id === id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  await writeData<Task>("tasks.json", tasks);
  return task;
};

export const deleteTask = async (id: string): Promise<Task> => {
  const tasks = await readData<Task>("tasks.json");
  const task = tasks.find((task) => task.id === id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  const updatedTask = tasks.filter((task) => task.id != id);
  await writeData<Task>("tasks.json", updatedTask);
  return task;
};
