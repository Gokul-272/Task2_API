import type { Request } from "express";

export type Task = {
  title: string;
  description: string;
  userId: string;
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
};

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
