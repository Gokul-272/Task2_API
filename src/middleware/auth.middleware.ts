import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import { verifyToken } from "../utils/jwt.utils.js";
import type { AuthRequest } from "../types.ts";

export const authenticateJWT = (req: AuthRequest, res: Response,next: NextFunction,): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authorization header is missing", 401));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError("Token is missing", 401));
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
