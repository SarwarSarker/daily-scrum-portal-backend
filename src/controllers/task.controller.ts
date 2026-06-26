// controllers/task.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { Role } from "../utlis/role";

// Roles that may edit any task regardless of ownership. Employees may only
// edit tasks they are assigned to.
const PRIVILEGED_ROLES = [Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD];

export const createTask = async (req: Request, res: Response) => {
  const { projectId, title, description, assignedTo, priority, status, dueDate } = req.body;

  if (!projectId || !title) {
    return sendError(res, 400, "projectId and title are required");
  }

  try {
    const task = await prisma.tasks.create({
      data: {
        projectId: BigInt(projectId),
        title,
        description,
        assignedTo: assignedTo != null ? BigInt(assignedTo) : undefined,
        priority: priority ?? undefined,
        status: status ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    return sendSuccess(res, 201, "Task created successfully", task);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return sendError(res, 400, "Invalid projectId or assignedTo");
    }
    throw err;
  }
};

export const listTasks = async (req: Request, res: Response) => {
  const { projectId, assignedTo, status, priority } = req.query;

  const where: Prisma.tasksWhereInput = {};
  if (projectId != null) where.projectId = BigInt(String(projectId));
  if (assignedTo != null) where.assignedTo = BigInt(String(assignedTo));
  if (status != null) where.status = String(status);
  if (priority != null) where.priority = String(priority);

  const tasks = await prisma.tasks.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, 200, "Tasks fetched successfully", tasks);
};

export const getTask = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const task = await prisma.tasks.findUnique({
    where: { id },
    include: {
      projects: true,
      task_comments: {
        include: { users: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!task) {
    return sendError(res, 404, "Task not found");
  }

  return sendSuccess(res, 200, "Task fetched successfully", task);
};

export const updateTask = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const existing = await prisma.tasks.findUnique({
    where: { id },
    select: { assignedTo: true },
  });
  if (!existing) {
    return sendError(res, 404, "Task not found");
  }

  const userId = BigInt(req.user!.id);
  const isPrivileged = PRIVILEGED_ROLES.includes(req.user!.role);
  const isAssigned = existing.assignedTo === userId;
  if (!isPrivileged && !isAssigned) {
    return sendError(res, 403, "You are not allowed to edit this task");
  }

  const { title, description, assignedTo, priority, status, dueDate } = req.body;

  const data: Prisma.tasksUpdateInput = { updatedAt: new Date() };
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (assignedTo !== undefined) data.assignedTo = assignedTo != null ? BigInt(assignedTo) : null;
  if (priority !== undefined) data.priority = priority;
  if (status !== undefined) data.status = status;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  try {
    const task = await prisma.tasks.update({ where: { id }, data });
    return sendSuccess(res, 200, "Task updated successfully", task);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Task not found");
      if (err.code === "P2003") return sendError(res, 400, "Invalid assignedTo");
    }
    throw err;
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  try {
    await prisma.tasks.delete({ where: { id } });
    return sendSuccess(res, 200, "Task deleted successfully");
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Task not found");
    }
    throw err;
  }
};
