import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import { verifyToken } from "../utils/jwt.utils.js";
import type { AuthRequest } from "../types.ts";

export const authenticateJWT = (req: AuthRequest, res: Response,next: NextFunction,): void => {
  const token = req.cookies.token;
  if (!token) {
    return next(new AppError("Token is missing", 401));
  }
  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
