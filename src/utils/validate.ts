import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

type RequestValidationSchema = z.ZodObject<{ body?: z.ZodType; params?: z.ZodType; query?: z.ZodType }>;

export const validate = (schema: RequestValidationSchema,) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (result.body !== undefined) {
        req.body = result.body;
      }

      if (result.params !== undefined) {
        req.params = result.params as Request["params"];
      }

      if (result.query !== undefined) {
        req.query = result.query as Request["query"];
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};