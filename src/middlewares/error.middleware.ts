// middleware/error.middleware.ts

import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { sendError } from "../utlis/response";

// Centralized error handler — keeps controllers free of try/catch boilerplate
// for unexpected failures.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.error(err);
  if (res.headersSent) return;

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
    return sendError(res, 400, message);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => {
      const path = e.path.join('.');
      const message = e.message;
      return path ? `${path}: ${message}` : message;
    });
    return sendError(res, 400, `Validation failed: ${errors.join(', ')}`);
  }

  return sendError(res, 500, "Internal server error");
};
