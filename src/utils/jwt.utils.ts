import jwt from "jsonwebtoken";
import { AppError } from "../middleware/error.middleware.js";
import type { JwtPayload } from "../types.ts";
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in the .env file");
}
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};
export const verifyToken = (token: string): JwtPayload => {
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
