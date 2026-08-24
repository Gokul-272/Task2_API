import { z } from "zod";
import mongoose from "mongoose";
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["todo", "inprogress", "completed"]).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().refine(
      (id) => mongoose.isValidObjectId(id)
    ),
  }),

  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(["todo", "inprogress", "completed"]).optional(),
  }),
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;