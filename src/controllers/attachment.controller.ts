// controllers/attachment.controller.ts

import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { sendSuccess, sendError } from "../utlis/response";
import { Role } from "../utlis/role";
import { env } from "../configs/env";

const userSelect = { select: { id: true, name: true, email: true } };

// Roles that may delete any attachment regardless of uploader.
const PRIVILEGED_ROLES = [Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD];

export const createAttachment = async (req: Request, res: Response) => {
  const { task_id, project_update_id } = req.body;

  // file_url comes from an uploaded file (multipart) or directly in the body
  // (e.g. an externally-hosted URL).
  const file_url = req.file ? `/uploads/${req.file.filename}` : req.body.file_url;

  if (!file_url) {
    return sendError(res, 400, "A file upload or file_url is required");
  }
  if (task_id == null && project_update_id == null) {
    return sendError(res, 400, "task_id or project_update_id is required");
  }

  try {
    const attachment = await prisma.attachments.create({
      data: {
        file_url,
        uploaded_by: BigInt(req.user!.id),
        task_id: task_id != null ? BigInt(task_id) : undefined,
        project_update_id: project_update_id != null ? BigInt(project_update_id) : undefined,
      },
      include: { users: userSelect },
    });
    return sendSuccess(res, 201, "Attachment created successfully", attachment);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return sendError(res, 400, "Invalid task_id or project_update_id");
    }
    throw err;
  }
};

export const listAttachments = async (req: Request, res: Response) => {
  const { task_id, project_update_id } = req.query;

  const where: Prisma.attachmentsWhereInput = {};
  if (task_id != null) where.task_id = BigInt(String(task_id));
  if (project_update_id != null) where.project_update_id = BigInt(String(project_update_id));

  const attachments = await prisma.attachments.findMany({
    where,
    include: { users: userSelect },
    orderBy: { created_at: "desc" },
  });

  return sendSuccess(res, 200, "Attachments fetched successfully", attachments);
};

export const getAttachment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const attachment = await prisma.attachments.findUnique({
    where: { id },
    include: { users: userSelect },
  });

  if (!attachment) {
    return sendError(res, 404, "Attachment not found");
  }

  return sendSuccess(res, 200, "Attachment fetched successfully", attachment);
};

export const deleteAttachment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const existing = await prisma.attachments.findUnique({
    where: { id },
    select: { uploaded_by: true, file_url: true },
  });
  if (!existing) {
    return sendError(res, 404, "Attachment not found");
  }

  const isPrivileged = PRIVILEGED_ROLES.includes(req.user!.role);
  const isOwner = existing.uploaded_by === BigInt(req.user!.id);
  if (!isPrivileged && !isOwner) {
    return sendError(res, 403, "You are not allowed to delete this attachment");
  }

  await prisma.attachments.delete({ where: { id } });

  // Best-effort cleanup of the backing file for locally-stored uploads.
  if (existing.file_url?.startsWith("/uploads/")) {
    const filePath = path.resolve(env.uploadDir, path.basename(existing.file_url));
    fs.promises.unlink(filePath).catch(() => undefined);
  }

  return sendSuccess(res, 200, "Attachment deleted successfully");
};
