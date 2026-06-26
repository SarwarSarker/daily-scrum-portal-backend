// controllers/project-update.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createProjectUpdate = async (req: Request, res: Response) => {
  const {
    project_id,
    updated_by,
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

  if (!project_id || !updated_by || !update_date) {
    return sendError(res, 400, "project_id, updated_by, and update_date are required");
  }

  try {
    const projectUpdate = await prisma.projectUpdate.create({
      data: {
        project_id: BigInt(project_id),
        updated_by: BigInt(updated_by),
        update_date: new Date(update_date),
        previous_progress,
        current_progress,
        weekly_movement,
        status,
        today_update,
        blockers,
        next_action,
        timeline_note,
        remarks,
      },
      include: {
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const serializedUpdate = {
      ...projectUpdate,
      id: projectUpdate.id.toString(),
      project_id: projectUpdate.project_id.toString(),
      updated_by: projectUpdate.updated_by.toString(),
      project: projectUpdate.project ? { ...projectUpdate.project, id: projectUpdate.project.id.toString() } : null,
      user: projectUpdate.user ? { ...projectUpdate.user, id: projectUpdate.user.id.toString() } : null,
    };

    return sendSuccess(res, 201, "Project update created successfully", serializedUpdate);
  } catch (error) {
    console.error("Error creating project update:", error);
    return sendError(res, 500, "Failed to create project update");
  }
};

export const getProjectUpdates = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.query;

    const where: any = {};
    if (project_id) where.projectId = BigInt(project_id as string);

    const projectUpdates = await prisma.projectUpdate.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ updateDate: "desc" }, { created_at: "desc" }],
    });

    const serializedUpdates = projectUpdates.map((update: any) => ({
      ...update,
      id: update.id.toString(),
      project_id: update.project_id.toString(),
      updated_by: update.updated_by.toString(),
      project: update.project ? { ...update.project, id: update.project.id.toString() } : null,
      user: update.user ? { ...update.user, id: update.user.id.toString() } : null,
    }));

    return sendSuccess(res, 200, "Project updates retrieved successfully", serializedUpdates);
  } catch (error) {
    console.error("Error fetching project updates:", error);
    return sendError(res, 500, "Failed to fetch project updates");
  }
};

export const getProjectUpdateById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const projectUpdate = await prisma.projectUpdate.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        project: {
          select: { id: true, title: true, status: true, description: true },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!projectUpdate) {
      return sendError(res, 404, "Project update not found");
    }

    const serializedUpdate = {
      ...projectUpdate,
      id: projectUpdate.id.toString(),
      project_id: projectUpdate.project_id.toString(),
      updated_by: projectUpdate.updated_by.toString(),
      project: projectUpdate.project ? { ...projectUpdate.project, id: projectUpdate.project.id.toString() } : null,
      user: projectUpdate.user ? { ...projectUpdate.user, id: projectUpdate.user.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Project update retrieved successfully", serializedUpdate);
  } catch (error) {
    console.error("Error fetching project update:", error);
    return sendError(res, 500, "Failed to fetch project update");
  }
};

export const updateProjectUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
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

  try {
    const projectUpdate = await prisma.projectUpdate.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(update_date && { update_date: new Date(update_date) }),
        ...(previous_progress !== undefined && { previous_progress }),
        ...(current_progress !== undefined && { current_progress }),
        ...(weekly_movement !== undefined && { weekly_movement }),
        ...(status !== undefined && { status }),
        ...(today_update !== undefined && { today_update }),
        ...(blockers !== undefined && { blockers }),
        ...(next_action !== undefined && { next_action }),
        ...(timeline_note !== undefined && { timeline_note }),
        ...(remarks !== undefined && { remarks }),
        updated_at: new Date(),
      },
      include: {
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const serializedUpdate = {
      ...projectUpdate,
      id: projectUpdate.id.toString(),
      project_id: projectUpdate.project_id.toString(),
      updated_by: projectUpdate.updated_by.toString(),
      project: projectUpdate.project ? { ...projectUpdate.project, id: projectUpdate.project.id.toString() } : null,
      user: projectUpdate.user ? { ...projectUpdate.user, id: projectUpdate.user.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Project update updated successfully", serializedUpdate);
  } catch (error) {
    console.error("Error updating project update:", error);
    return sendError(res, 500, "Failed to update project update");
  }
};

export const deleteProjectUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.projectUpdate.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Project update deleted successfully");
  } catch (error) {
    console.error("Error deleting project update:", error);
    return sendError(res, 500, "Failed to delete project update");
  }
};
