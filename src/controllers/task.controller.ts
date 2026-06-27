// controllers/task.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

// Task Comment Controllers
export const createTaskComment = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { user_id, comment } = req.body;

  try {
    await prisma.taskComment.create({
      data: {
        task_id: BigInt(Array.isArray(taskId) ? taskId[0] : taskId),
        user_id: BigInt(user_id),
        comment,
      },
    });

    return sendSuccess(res, 201, "Task comment created successfully");
  } catch (error) {
    console.error("Error creating task comment:", error);
    return sendError(res, 500, "Failed to create task comment");
  }
};

export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const where: any = {};
    if (taskId) where.task_id = BigInt(Array.isArray(taskId) ? taskId[0] : taskId);

    const taskComments = await prisma.taskComment.findMany({
      where,
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const serializedComments = taskComments.map((comment: any) => ({
      ...comment,
      id: comment.id.toString(),
      task_id: comment.task_id.toString(),
      user_id: comment.user_id.toString(),
      task: comment.task ? { ...comment.task, id: comment.task.id.toString() } : null,
      user: comment.user ? { ...comment.user, id: comment.user.id.toString() } : null,
    }));

    return sendSuccess(res, 200, "Task comments retrieved successfully", serializedComments);
  } catch (error) {
    console.error("Error fetching task comments:", error);
    return sendError(res, 500, "Failed to fetch task comments");
  }
};

export const getTaskCommentById = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const taskComment = await prisma.taskComment.findUnique({
      where: { id: BigInt(toString(Array.isArray(commentId) ? commentId[0] : commentId)) },
      include: {
        task: { select: { id: true, title: true, status: true, project_id: true } },
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      },
    });

    if (!taskComment) {
      return sendError(res, 404, "Task comment not found");
    }

    const serializedComment = {
      ...taskComment,
      id: taskComment.id.toString(),
      task_id: taskComment.task_id.toString(),
      user_id: taskComment.user_id.toString(),
      task: taskComment.task ? { ...taskComment.task, id: taskComment.task.id.toString() } : null,
      user: taskComment.user ? { ...taskComment.user, id: taskComment.user.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Task comment retrieved successfully", serializedComment);
  } catch (error) {
    console.error("Error fetching task comment:", error);
    return sendError(res, 500, "Failed to fetch task comment");
  }
};

export const updateTaskComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { comment } = req.body;

  try {
    const taskComment = await prisma.taskComment.update({
      where: { id: BigInt(toString(Array.isArray(commentId) ? commentId[0] : commentId)) },
      data: {
        comment,
        updated_at: new Date(),
      },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const serializedComment = {
      ...taskComment,
      id: taskComment.id.toString(),
      task_id: taskComment.task_id.toString(),
      user_id: taskComment.user_id.toString(),
      task: taskComment.task ? { ...taskComment.task, id: taskComment.task.id.toString() } : null,
      user: taskComment.user ? { ...taskComment.user, id: taskComment.user.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Task comment updated successfully", serializedComment);
  } catch (error) {
    console.error("Error updating task comment:", error);
    return sendError(res, 500, "Failed to update task comment");
  }
};

export const deleteTaskComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    await prisma.taskComment.delete({
      where: { id: BigInt(toString(Array.isArray(commentId) ? commentId[0] : commentId)) },
    });

    return sendSuccess(res, 200, "Task comment deleted successfully");
  } catch (error) {
    console.error("Error deleting task comment:", error);
    return sendError(res, 500, "Failed to delete task comment");
  }
};

export const createTask = async (req: Request, res: Response) => {
  const { project_id, assigned_to, created_by, title, description, status, priority, progress, start_date, end_date, blocker, output } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        project_id: BigInt(project_id),
        assigned_to: assigned_to != null ? BigInt(assigned_to) : null,
        created_by: created_by != null ? BigInt(created_by) : null,
        title,
        description,
        status: status ?? "todo",
        priority: priority ?? "medium",
        progress: progress ?? 0,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        blocker,
        output,
      },
    });

    const serializedTask = {
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      created_by: task.created_by?.toString(),
      start_date: task.start_date?.toISOString(),
      end_date: task.end_date?.toISOString(),
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
      created_by: task.created_by?.toString(),
      start_date: task.start_date?.toISOString(),
      end_date: task.end_date?.toISOString(),
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
      created_by: task.created_by?.toString(),
      start_date: task.start_date?.toISOString(),
      end_date: task.end_date?.toISOString(),
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
    created_by,
    title,
    description,
    status,
    priority,
    progress,
    start_date,
    end_date,
    blocker,
    output,
  } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(assigned_to !== undefined && { assigned_to: assigned_to != null ? BigInt(assigned_to) : null }),
        ...(created_by !== undefined && { created_by: created_by != null ? BigInt(created_by) : null }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(progress !== undefined && { progress }),
        ...(start_date !== undefined && { start_date: start_date ? new Date(start_date) : null }),
        ...(end_date !== undefined && { end_date: end_date ? new Date(end_date) : null }),
        ...(blocker !== undefined && { blocker }),
        ...(output !== undefined && { output }),
        updated_at: new Date(),
      },
    });

    const serializedTask = {
      ...task,
      id: task.id.toString(),
      project_id: task.project_id.toString(),
      assigned_to: task.assigned_to?.toString(),
      created_by: task.created_by?.toString(),
      start_date: task.start_date?.toISOString(),
      end_date: task.end_date?.toISOString(),
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
