import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import type { LoginRequest, RegisterRequest } from "../types.ts";
export const register = async (req: Request, res: Response, next: NextFunction,): Promise<void> => {
  try {
    const credentials = req.body as RegisterRequest;
    const token = await registerUser(credentials);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction,): Promise<void> => {
  try {
    const credentials = req.body as LoginRequest;
    const token = await loginUser(credentials);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token
    });
  } catch (error) {
    next(error);
  }
};
