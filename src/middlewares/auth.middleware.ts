// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";
import { env } from "../configs/env";
import { sendError } from "../utlis/response";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendError(res, 401, "Unauthorized");
    }

    const decoded = jwt.verify(
      token,
      env.jwtAccessSecret
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch {
    return sendError(res, 401, "Invalid token");
  }
};