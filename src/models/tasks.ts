
import mongoose, { Schema } from "mongoose";
import type { Task } from "../types.js";

const taskSchema = new Schema<Task>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["todo", "inprogress", "completed"],
    default: "todo",
  }},

  {
    timestamps: true,
  }
);
export const TaskModel = mongoose.model<Task>("Task", taskSchema);
