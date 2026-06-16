// controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database";
import { env } from "../configs/env";
import { Role } from "../utlis/role";
import { sendSuccess, sendError } from "../utlis/response";

export const register = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    designation,
    avatar,
    team_id,
    department_id,
    status,
  } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 400, "name, email and password are required");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return sendError(res, 409, "Email already registered");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role ?? Role.EMPLOYEE,
      designation,
      avatar,
      teamId: team_id != null ? BigInt(team_id) : undefined,
      departmentId: department_id != null ? BigInt(department_id) : undefined,
      status: status ?? undefined,
    },
  });

  return sendSuccess(res, 201, "User registered successfully");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return sendError(res, 401, "Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id.toString(), email: user.email, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.accessExpires } as jwt.SignOptions
  );

  return sendSuccess(res, 200, "Login successful", { token });
};
