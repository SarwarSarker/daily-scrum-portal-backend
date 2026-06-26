// controllers/task.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createTask = async (req: Request, res: Response) => {
  const { project_id, assigned_to, title, description, status, priority, due_date } = req.body;

  if (!project_id || !title) {
    return sendError(res, 400, "project_id and title are required");
  }

  try {
    const task = await prisma.task.create({
      data: {
        project_id: BigInt(project_id),
        assigned_to: assigned_to ? BigInt(assigned_to) : null,
        title,
        description,
        status: status ?? "todo",
        priority: priority ?? "medium",
        due_date: due_date ? new Date(due_date) : null,
      },
    });

    const serializedTask = {
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      due_date: task.due_date?.toISOString(),
    };

    return sendSuccess(res, 201, "Task created successfully", serializedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return sendError(res, 500, "Failed to create task");
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { project_id, status, assigned_to } = req.query;

    const where: any = {};
    if (project_id) where.project_id = BigInt(project_id as string);
    if (status) where.status = status as string;
    if (assigned_to) where.assigned_to = BigInt(assigned_to as string);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const serializedTasks = tasks.map((task: any) => ({
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      due_date: task.due_date?.toISOString(),
      project: task.project ? { ...task.project, id: task.project.id.toString() } : null,
    }));

    return sendSuccess(res, 200, "Tasks retrieved successfully", serializedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return sendError(res, 500, "Failed to fetch tasks");
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return sendError(res, 404, "Task not found");
    }

    const serializedTask = {
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      due_date: task.due_date?.toISOString(),
      project: task.project ? { ...task.project, id: task.project.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Task retrieved successfully", serializedTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return sendError(res, 500, "Failed to fetch task");
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    assigned_to,
    title,
    description,
    status,
    priority,
    due_date,
  } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(assigned_to !== undefined && { assigned_to: assigned_to ? BigInt(assigned_to) : null }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        updated_at: new Date(),
      },
    });

    const serializedTask = {
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      due_date: task.due_date?.toISOString(),
    };

    return sendSuccess(res, 200, "Task updated successfully", serializedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return sendError(res, 500, "Failed to update task");
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Task deleted successfully");
  } catch (error) {
    console.error("Error deleting task:", error);
    return sendError(res, 500, "Failed to delete task");
  }
};
