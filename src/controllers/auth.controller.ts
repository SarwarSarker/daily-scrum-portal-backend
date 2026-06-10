// controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database";
import { env } from "../configs/env";
import { Role } from "../utlis/role";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role ?? Role.EMPLOYEE,
    },
  });

  return res.status(201).json({
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id.toString(), email: user.email, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: env.accessExpires } as jwt.SignOptions
  );

  return res.json({ token });
};
