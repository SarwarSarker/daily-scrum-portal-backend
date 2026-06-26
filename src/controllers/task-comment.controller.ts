// controllers/task-comment.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createTaskComment = async (req: Request, res: Response) => {
  const { task_id, user_id, comment } = req.body;

  if (!task_id || !user_id || !comment) {
    return sendError(res, 400, "task_id, user_id, and comment are required");
  }

  try {
    const taskComment = await prisma.taskComment.create({
      data: {
        task_id: BigInt(task_id),
        user_id: BigInt(user_id),
        comment,
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

    return sendSuccess(res, 201, "Task comment created successfully", serializedComment);
  } catch (error) {
    console.error("Error creating task comment:", error);
    return sendError(res, 500, "Failed to create task comment");
  }
};

export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.query;

    const where: any = {};
    if (task_id) where.task_id = BigInt(task_id as string);

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
  const { id } = req.params;

  try {
    const taskComment = await prisma.taskComment.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        task: { select: { id: true, title: true, status: true, projectId: true } },
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
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return sendError(res, 400, "comment is required");
  }

  try {
    const taskComment = await prisma.taskComment.update({
      where: { id: BigInt(toString(id)) },
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
  const { id } = req.params;

  try {
    await prisma.taskComment.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Task comment deleted successfully");
  } catch (error) {
    console.error("Error deleting task comment:", error);
    return sendError(res, 500, "Failed to delete task comment");
  }
};
