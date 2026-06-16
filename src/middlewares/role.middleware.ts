// middleware/role.middleware.ts

import { Request, Response, NextFunction } from "express";
import { Role } from "../utlis/role";
import { sendError } from "../utlis/response";

export const authorize = (...roles: Role[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden");
    }

    next();
  };
};