// controllers/project.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createProject = async (req: Request, res: Response) => {
  const { title, owner_id, team_id, created_by, status, description, blockers } = req.body;

  if (!title || !owner_id || !team_id || !created_by) {
    return sendError(res, 400, "title, owner_id, team_id, and created_by are required");
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        owner_id: BigInt(owner_id),
        team_id: BigInt(team_id),
        created_by: BigInt(created_by),
        status: status ?? "active",
        description,
        blockers,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id.toString(),
      team_id: project.team_id.toString(),
      created_by: project.created_by.toString(),
      owner: project.owner ? { ...project.owner, id: project.owner.id.toString() } : null,
      creator: project.creator ? { ...project.creator, id: project.creator.id.toString() } : null,
      team: project.team ? { ...project.team, id: project.team.id.toString() } : null,
    };

    return sendSuccess(res, 201, "Project created successfully", serializedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return sendError(res, 500, "Failed to create project");
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        tasks: true,
        projectUpdates: true,
      },
      orderBy: { created_at: "desc" },
    });

    const serializedProjects = projects.map((project: any) => ({
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id.toString(),
      team_id: project.team_id.toString(),
      created_by: project.created_by.toString(),
      owner: project.owner ? { ...project.owner, id: project.owner.id.toString() } : null,
      creator: project.creator ? { ...project.creator, id: project.creator.id.toString() } : null,
      team: project.team ? { ...project.team, id: project.team.id.toString() } : null,
      tasks: project.tasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        projectId: task.projectId.toString(),
        assignedTo: task.assignedTo?.toString(),
        createdBy: task.createdBy.toString(),
      })),
      projectUpdates: project.projectUpdates.map((update: any) => ({
        ...update,
        id: update.id.toString(),
        projectId: update.projectId.toString(),
        updatedBy: update.updatedBy.toString(),
      })),
    }));

    return sendSuccess(res, 200, "Projects retrieved successfully", serializedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return sendError(res, 500, "Failed to fetch projects");
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
        },
        projectUpdates: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { update_date: "desc" },
        },
      },
    });

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id.toString(),
      team_id: project.team_id.toString(),
      created_by: project.created_by.toString(),
      owner: project.owner ? { ...project.owner, id: project.owner.id.toString() } : null,
      creator: project.creator ? { ...project.creator, id: project.creator.id.toString() } : null,
      team: project.team ? { ...project.team, id: project.team.id.toString() } : null,
      tasks: project.tasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        projectId: task.projectId.toString(),
        assignedTo: task.assignedTo?.toString(),
        createdBy: task.createdBy.toString(),
        assignee: task.assignee ? { ...task.assignee, id: task.assignee.id.toString() } : null,
        creator: task.creator ? { ...task.creator, id: task.creator.id.toString() } : null,
      })),
      projectUpdates: project.projectUpdates.map((update: any) => ({
        ...update,
        id: update.id.toString(),
        projectId: update.projectId.toString(),
        updatedBy: update.updatedBy.toString(),
        user: update.user ? { ...update.user, id: update.user.id.toString() } : null,
      })),
    };

    return sendSuccess(res, 200, "Project retrieved successfully", serializedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return sendError(res, 500, "Failed to fetch project");
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, owner_id, team_id, status, description, blockers } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(title && { title }),
        ...(owner_id && { owner_id: BigInt(owner_id) }),
        ...(team_id && { team_id: BigInt(team_id) }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(blockers !== undefined && { blockers }),
        updated_at: new Date(),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id.toString(),
      team_id: project.team_id.toString(),
      created_by: project.created_by.toString(),
      owner: project.owner ? { ...project.owner, id: project.owner.id.toString() } : null,
      creator: project.creator ? { ...project.creator, id: project.creator.id.toString() } : null,
      team: project.team ? { ...project.team, id: project.team.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Project updated successfully", serializedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return sendError(res, 500, "Failed to update project");
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.project.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Project deleted successfully");
  } catch (error) {
    console.error("Error deleting project:", error);
    return sendError(res, 500, "Failed to delete project");
  }
};
