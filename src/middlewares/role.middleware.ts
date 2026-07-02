// middleware/role.middleware.ts

import { Request, Response, NextFunction } from "express";
import { Role } from "../utlis/role";
import { sendError } from "../utlis/response";

type AuthorizeOptions = { message?: string };

export const authorize = (...args: (Role | AuthorizeOptions)[]) => {
  const roles = args.filter((arg): arg is Role => typeof arg === "string");
  const { message } =
    (args.find((arg) => typeof arg === "object") as AuthorizeOptions) ?? {};
  const forbiddenMessage = message ?? "You are not permitted to perform this action";

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    // Compare case-insensitively: role values may be stored/tokenized with
    // different casing (e.g. "Manager") than the lowercase Role enum.
    const userRole = String(req.user.role).toLowerCase();
    if (!roles.some((role) => role.toLowerCase() === userRole)) {
      return sendError(res, 403, forbiddenMessage);
    }

    next();
  };
};