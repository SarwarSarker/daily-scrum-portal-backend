// controllers/project-update.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";

const userSelect = { select: { id: true, name: true, email: true } };

export const createProjectUpdate = async (req: Request, res: Response) => {
  const {
    project_id,
    update_date,
    previous_progress,
    current_progress,
    weekly_movement,
    status,
    today_update,
    blockers,
    next_action,
    timeline_note,
    remarks,
  } = req.body;

  if (!project_id) {
    return sendError(res, 400, "project_id is required");
  }

  try {
    const update = await prisma.project_updates.create({
      data: {
        project_id: BigInt(project_id),
        updated_by: BigInt(req.user!.id),
        update_date: update_date ? new Date(update_date) : new Date(),
        previous_progress: previous_progress != null ? Number(previous_progress) : undefined,
        current_progress: current_progress != null ? Number(current_progress) : undefined,
        weekly_movement: weekly_movement != null ? Number(weekly_movement) : undefined,
        status,
        today_update,
        blockers,
        next_action,
        timeline_note,
        remarks,
      },
    });
    return sendSuccess(res, 201, "Project update created successfully", update);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return sendError(res, 400, "Invalid project_id");
    }
    throw err;
  }
};

export const listProjectUpdates = async (req: Request, res: Response) => {
  const { project_id, updated_by } = req.query;

  const where: Prisma.project_updatesWhereInput = {};
  if (project_id != null) where.project_id = BigInt(String(project_id));
  if (updated_by != null) where.updated_by = BigInt(String(updated_by));

  const updates = await prisma.project_updates.findMany({
    where,
    include: { users: userSelect },
    orderBy: { update_date: "desc" },
  });

  return sendSuccess(res, 200, "Project updates fetched successfully", updates);
};

export const getProjectUpdate = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const update = await prisma.project_updates.findUnique({
    where: { id },
    include: { users: userSelect, projects: true, attachments: true },
  });

  if (!update) {
    return sendError(res, 404, "Project update not found");
  }

  return sendSuccess(res, 200, "Project update fetched successfully", update);
};

export const updateProjectUpdate = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));
  const {
    update_date,
    previous_progress,
    current_progress,
    weekly_movement,
    status,
    today_update,
    blockers,
    next_action,
    timeline_note,
    remarks,
  } = req.body;

  const data: Prisma.project_updatesUpdateInput = { updated_at: new Date() };
  if (update_date !== undefined) data.update_date = new Date(update_date);
  if (previous_progress !== undefined)
    data.previous_progress = previous_progress != null ? Number(previous_progress) : null;
  if (current_progress !== undefined)
    data.current_progress = current_progress != null ? Number(current_progress) : null;
  if (weekly_movement !== undefined)
    data.weekly_movement = weekly_movement != null ? Number(weekly_movement) : null;
  if (status !== undefined) data.status = status;
  if (today_update !== undefined) data.today_update = today_update;
  if (blockers !== undefined) data.blockers = blockers;
  if (next_action !== undefined) data.next_action = next_action;
  if (timeline_note !== undefined) data.timeline_note = timeline_note;
  if (remarks !== undefined) data.remarks = remarks;

  try {
    const update = await prisma.project_updates.update({ where: { id }, data });
    return sendSuccess(res, 200, "Project update updated successfully", update);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Project update not found");
    }
    throw err;
  }
};

export const deleteProjectUpdate = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  try {
    await prisma.project_updates.delete({ where: { id } });
    return sendSuccess(res, 200, "Project update deleted successfully");
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Project update not found");
    }
    throw err;
  }
};
