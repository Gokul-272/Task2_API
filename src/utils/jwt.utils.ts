import jwt from "jsonwebtoken";
import { AppError } from "../middleware/error.middleware.js";
import type { JwtPayload } from "../types.ts";
import type { StringValue } from "ms";
export const generateToken = (payload: JwtPayload, secret: string, expires: StringValue): string => {
 if (!secret) {
  throw new Error("JWT_SECRET is not defined in the .env file");
 }
  return jwt.sign(payload, secret, { expiresIn: expires });
};
export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object") {
      throw new AppError("Invalid token", 401);
    }
    return decoded as JwtPayload;
  } catch (err: unknown) {
    throw new AppError("Invalid or expired token", 401);
  }
};
