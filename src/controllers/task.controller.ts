// controllers/task.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { sendSuccess, sendError } from "../utlis/response";
import { Role } from "../utlis/role";

const userSelect = { select: { id: true, name: true, email: true } };

// Roles that may edit any task regardless of ownership. Employees may only
// edit tasks they created or are assigned to.
const PRIVILEGED_ROLES = [Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD];

export const createTask = async (req: Request, res: Response) => {
  const {
    project_id,
    title,
    assigned_to,
    description,
    task_type,
    status,
    priority,
    progress,
    dependency_task_id,
    blocker,
    expected_output,
    start_date,
    due_date,
  } = req.body;

  if (!project_id || !title) {
    return sendError(res, 400, "project_id and title are required");
  }

  try {
    const task = await prisma.tasks.create({
      data: {
        project_id: BigInt(project_id),
        title,
        created_by: BigInt(req.user!.id),
        assigned_to: assigned_to != null ? BigInt(assigned_to) : undefined,
        description,
        task_type,
        status: status ?? undefined,
        priority: priority ?? undefined,
        progress: progress != null ? Number(progress) : undefined,
        dependency_task_id: dependency_task_id != null ? BigInt(dependency_task_id) : undefined,
        blocker,
        expected_output,
        start_date: start_date ? new Date(start_date) : undefined,
        due_date: due_date ? new Date(due_date) : undefined,
      },
    });
    return sendSuccess(res, 201, "Task created successfully", task);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return sendError(res, 400, "Invalid project_id, assigned_to or dependency_task_id");
    }
    throw err;
  }
};

export const listTasks = async (req: Request, res: Response) => {
  const { project_id, assigned_to, status, priority } = req.query;

  const where: Prisma.tasksWhereInput = {};
  if (project_id != null) where.project_id = BigInt(String(project_id));
  if (assigned_to != null) where.assigned_to = BigInt(String(assigned_to));
  if (status != null) where.status = String(status);
  if (priority != null) where.priority = String(priority);

  const tasks = await prisma.tasks.findMany({
    where,
    include: {
      users_tasks_assigned_toTousers: userSelect,
      users_tasks_created_byTousers: userSelect,
    },
    orderBy: { created_at: "desc" },
  });

  return sendSuccess(res, 200, "Tasks fetched successfully", tasks);
};

export const getTask = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const task = await prisma.tasks.findUnique({
    where: { id },
    include: {
      projects: true,
      users_tasks_assigned_toTousers: userSelect,
      users_tasks_created_byTousers: userSelect,
      task_comments: { include: { users: userSelect }, orderBy: { created_at: "asc" } },
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
    select: { assigned_to: true, created_by: true },
  });
  if (!existing) {
    return sendError(res, 404, "Task not found");
  }

  const userId = BigInt(req.user!.id);
  const isPrivileged = PRIVILEGED_ROLES.includes(req.user!.role);
  const isOwner =
    existing.created_by === userId || existing.assigned_to === userId;
  if (!isPrivileged && !isOwner) {
    return sendError(res, 403, "You are not allowed to edit this task");
  }

  const {
    title,
    assigned_to,
    description,
    task_type,
    status,
    priority,
    progress,
    dependency_task_id,
    blocker,
    expected_output,
    start_date,
    due_date,
  } = req.body;

  const data: Prisma.tasksUpdateInput = { updated_at: new Date() };
  if (title !== undefined) data.title = title;
  if (assigned_to !== undefined) {
    data.users_tasks_assigned_toTousers =
      assigned_to != null
        ? { connect: { id: BigInt(assigned_to) } }
        : { disconnect: true };
  }
  if (description !== undefined) data.description = description;
  if (task_type !== undefined) data.task_type = task_type;
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (progress !== undefined) data.progress = Number(progress);
  if (dependency_task_id !== undefined) {
    data.tasks =
      dependency_task_id != null
        ? { connect: { id: BigInt(dependency_task_id) } }
        : { disconnect: true };
  }
  if (blocker !== undefined) data.blocker = blocker;
  if (expected_output !== undefined) data.expected_output = expected_output;
  if (start_date !== undefined) data.start_date = start_date ? new Date(start_date) : null;
  if (due_date !== undefined) data.due_date = due_date ? new Date(due_date) : null;

  try {
    const task = await prisma.tasks.update({ where: { id }, data });
    return sendSuccess(res, 200, "Task updated successfully", task);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Task not found");
      if (err.code === "P2003")
        return sendError(res, 400, "Invalid assigned_to or dependency_task_id");
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
