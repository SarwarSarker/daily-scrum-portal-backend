// middleware/error.middleware.ts

import { Request, Response, NextFunction } from "express";
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
  return sendError(res, 500, "Internal server error");
};
