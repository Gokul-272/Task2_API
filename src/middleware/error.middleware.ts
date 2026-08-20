import type { Request, Response, NextFunction } from "express";
export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const errorHandler = (err: Error | AppError | unknown, req: Request, res: Response, next: NextFunction,) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Internal Server Error" });
};
