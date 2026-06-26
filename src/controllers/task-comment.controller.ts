// controllers/task-comment.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { Role } from "../utlis/role";

const userSelect = { select: { id: true, name: true, email: true } };

// Roles that may edit/delete any comment regardless of authorship.
const PRIVILEGED_ROLES = [Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD];

export const createTaskComment = async (req: Request, res: Response) => {
  const { task_id, comment } = req.body;

  if (!task_id || !comment) {
    return sendError(res, 400, "task_id and comment are required");
  }

  try {
    const created = await prisma.task_comments.create({
      data: {
        task_id: BigInt(task_id),
        user_id: BigInt(req.user!.id),
        comment,
      },
      include: { users: userSelect },
    });
    return sendSuccess(res, 201, "Comment created successfully", created);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return sendError(res, 400, "Invalid task_id");
    }
    throw err;
  }
};

export const listTaskComments = async (req: Request, res: Response) => {
  const { task_id } = req.query;

  const where: Prisma.task_commentsWhereInput = {};
  if (task_id != null) where.task_id = BigInt(String(task_id));

  const comments = await prisma.task_comments.findMany({
    where,
    include: { users: userSelect },
    orderBy: { created_at: "asc" },
  });

  return sendSuccess(res, 200, "Comments fetched successfully", comments);
};

export const updateTaskComment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));
  const { comment } = req.body;

  if (!comment) {
    return sendError(res, 400, "comment is required");
  }

  const existing = await prisma.task_comments.findUnique({
    where: { id },
    select: { user_id: true },
  });
  if (!existing) {
    return sendError(res, 404, "Comment not found");
  }

  const isPrivileged = PRIVILEGED_ROLES.includes(req.user!.role);
  const isOwner = existing.user_id === BigInt(req.user!.id);
  if (!isPrivileged && !isOwner) {
    return sendError(res, 403, "You are not allowed to edit this comment");
  }

  const updated = await prisma.task_comments.update({
    where: { id },
    data: { comment, updated_at: new Date() },
    include: { users: userSelect },
  });
  return sendSuccess(res, 200, "Comment updated successfully", updated);
};

export const deleteTaskComment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const existing = await prisma.task_comments.findUnique({
    where: { id },
    select: { user_id: true },
  });
  if (!existing) {
    return sendError(res, 404, "Comment not found");
  }

  const isPrivileged = PRIVILEGED_ROLES.includes(req.user!.role);
  const isOwner = existing.user_id === BigInt(req.user!.id);
  if (!isPrivileged && !isOwner) {
    return sendError(res, 403, "You are not allowed to delete this comment");
  }

  await prisma.task_comments.delete({ where: { id } });
  return sendSuccess(res, 200, "Comment deleted successfully");
};
