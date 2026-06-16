// controllers/project.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { sendSuccess, sendError } from "../utlis/response";

const ownerSelect = { select: { id: true, name: true, email: true } };

export const createProject = async (req: Request, res: Response) => {
  const {
    project_name,
    owner_id,
    team_id,
    category,
    status,
    priority,
    current_progress,
    target_progress,
    risk_level,
    due_date,
    description,
  } = req.body;

  if (!project_name) {
    return sendError(res, 400, "project_name is required");
  }

  const resolvedOwner = owner_id != null ? owner_id : req.user!.id;

  try {
    const project = await prisma.projects.create({
      data: {
        project_name,
        owner_id: BigInt(resolvedOwner),
        team_id: team_id != null ? BigInt(team_id) : undefined,
        category,
        status: status ?? undefined,
        priority: priority ?? undefined,
        current_progress: current_progress != null ? Number(current_progress) : undefined,
        target_progress: target_progress != null ? Number(target_progress) : undefined,
        risk_level: risk_level ?? undefined,
        due_date: due_date ? new Date(due_date) : undefined,
        description,
      },
    });
    return sendSuccess(res, 201, "Project created successfully", project);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return sendError(res, 400, "Invalid owner_id or team_id");
    }
    throw err;
  }
};

export const listProjects = async (req: Request, res: Response) => {
  const { status, team_id, owner_id, priority } = req.query;

  const where: Prisma.projectsWhereInput = {};
  if (status != null) where.status = String(status);
  if (priority != null) where.priority = String(priority);
  if (team_id != null) where.team_id = BigInt(String(team_id));
  if (owner_id != null) where.owner_id = BigInt(String(owner_id));

  const projects = await prisma.projects.findMany({
    where,
    include: { users: ownerSelect },
    orderBy: { created_at: "desc" },
  });

  return sendSuccess(res, 200, "Projects fetched successfully", projects);
};

export const getProject = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const project = await prisma.projects.findUnique({
    where: { id },
    include: {
      users: ownerSelect,
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
  const {
    project_name,
    owner_id,
    team_id,
    category,
    status,
    priority,
    current_progress,
    target_progress,
    risk_level,
    due_date,
    description,
  } = req.body;

  const data: Prisma.projectsUpdateInput = { updated_at: new Date() };
  if (project_name !== undefined) data.project_name = project_name;
  if (owner_id !== undefined) data.users = { connect: { id: BigInt(owner_id) } };
  if (team_id !== undefined) data.team_id = team_id != null ? BigInt(team_id) : null;
  if (category !== undefined) data.category = category;
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (current_progress !== undefined) data.current_progress = Number(current_progress);
  if (target_progress !== undefined) data.target_progress = Number(target_progress);
  if (risk_level !== undefined) data.risk_level = risk_level;
  if (due_date !== undefined) data.due_date = due_date ? new Date(due_date) : null;
  if (description !== undefined) data.description = description;

  try {
    const project = await prisma.projects.update({ where: { id }, data });
    return sendSuccess(res, 200, "Project updated successfully", project);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Project not found");
      if (err.code === "P2003") return sendError(res, 400, "Invalid owner_id or team_id");
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
