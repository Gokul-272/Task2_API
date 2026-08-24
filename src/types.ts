import type { Request } from "express";

export type TaskStatus = "todo" | "inprogress" | "completed";

export type Task = {
  title: string;
  description: string;
  userId: string;
  status: TaskStatus;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type User = {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string | undefined;
  resetPasswordExpire?: Date | undefined;
};

export type LoginRequest = {
  email?: string;
  password?: string;
};

export type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export type JwtPayload = {
  userId: string;
  email: string;
  sessionId?: string; 
};

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
