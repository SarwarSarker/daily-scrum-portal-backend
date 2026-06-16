// utlis/response.ts

import { Response } from "express";

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    ...(data !== undefined ? { data } : {}),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
