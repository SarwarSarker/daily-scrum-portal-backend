// utlis/helper.ts

import { Request, Response, NextFunction, RequestHandler } from "express";

export const slugify = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Wraps an async route handler so rejected promises are forwarded to
// Express's error-handling middleware instead of becoming unhandled rejections.
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
