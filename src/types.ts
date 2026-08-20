import type { Request } from "express";

export type Task = {
  id: string;
  title: string;
  description: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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
};

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
