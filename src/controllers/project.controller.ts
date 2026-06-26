// controllers/project.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { sendSuccess, sendError } from "../utlis/response";

export const createProject = async (req: Request, res: Response) => {
  const { name, description, startDate, endDate, status } = req.body;

  if (!name) {
    return sendError(res, 400, "name is required");
  }

  try {
    const project = await prisma.projects.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status ?? undefined,
      },
    });
    return sendSuccess(res, 201, "Project created successfully", project);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return sendError(res, 400, "Invalid data provided");
    }
    throw err;
  }
};

export const listProjects = async (req: Request, res: Response) => {
  const { status } = req.query;

  const where: Prisma.projectsWhereInput = {};
  if (status != null) where.status = String(status);

  const projects = await prisma.projects.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, "Projects fetched successfully", projects);
};

export const getProject = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const project = await prisma.projects.findUnique({
    where: { id },
    include: {
      tasks: true,
    },
  });

  if (!project) {
    return sendError(res, 404, "Project not found");
  }

  return sendSuccess(res, 200, "Project fetched successfully", project);
};

export const updateProject = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));
  const { name, description, startDate, endDate, status } = req.body;

  const data: Prisma.projectsUpdateInput = { updatedAt: new Date() };
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
  if (status !== undefined) data.status = status;

  try {
    const project = await prisma.projects.update({ where: { id }, data });
    return sendSuccess(res, 200, "Project updated successfully", project);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Project not found");
      if (err.code === "P2003") return sendError(res, 400, "Invalid data provided");
    }
    throw err;
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  try {
    await prisma.projects.delete({ where: { id } });
    return sendSuccess(res, 200, "Project deleted successfully");
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Project not found");
    }
    throw err;
  }
};
