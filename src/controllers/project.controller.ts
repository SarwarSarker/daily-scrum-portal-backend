// controllers/project.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createProject = async (req: Request, res: Response) => {
  const { name, status, description, owner_id, team_id, created_by, blocker } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        status: status ?? "planning",
        description,
        owner_id: owner_id != null ? BigInt(owner_id) : null,
        team_id: team_id != null ? BigInt(team_id) : null,
        created_by: created_by != null ? BigInt(created_by) : null,
        blocker,
      },
    });

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id?.toString(),
      team_id: project.team_id?.toString(),
      created_by: project.created_by?.toString(),
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
      orderBy: { created_at: "desc" },
    });

    // Collect all unique owner IDs, team IDs, and created_by IDs
    const ownerIds = [...new Set(projects.map((p) => p.owner_id).filter(Boolean))] as bigint[];
    const teamIds = [...new Set(projects.map((p) => p.team_id).filter(Boolean))] as bigint[];
    const createdByIds = [...new Set(projects.map((p) => p.created_by).filter(Boolean))] as bigint[];

    // Fetch users and teams in parallel
    const [users, teams] = await Promise.all([
      ownerIds.length > 0 || createdByIds.length > 0
        ? prisma.user.findMany({
            where: {
              id: { in: [...new Set([...ownerIds, ...createdByIds])] },
            },
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          })
        : [],
      teamIds.length > 0
        ? prisma.team.findMany({
            where: {
              id: { in: teamIds },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
    ]);

    // Create maps for easy lookup
    const userMap = new Map(users.map((u) => [u.id.toString(), u]));
    const teamMap = new Map(teams.map((t) => [t.id.toString(), t]));

    const serializedProjects = projects.map((project: any) => ({
      ...project,
      id: project.id.toString(),
      owner: project.owner_id ? userMap.get(project.owner_id.toString()) || null : null,
      team: project.team_id ? teamMap.get(project.team_id.toString()) || null : null,
      createdBy: project.created_by ? userMap.get(project.created_by.toString()) || null : null,
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
    });

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    // Fetch related users and team
    const userIds = [project.owner_id, project.created_by].filter(Boolean) as bigint[];
    const teamIds = project.team_id ? [project.team_id] : [];

    const [users, teams] = await Promise.all([
      userIds.length > 0
        ? prisma.user.findMany({
            where: {
              id: { in: userIds },
            },
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          })
        : [],
      teamIds.length > 0
        ? prisma.team.findMany({
            where: {
              id: { in: teamIds },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [],
    ]);

    // Create maps for easy lookup
    const userMap = new Map(users.map((u) => [u.id.toString(), u]));
    const teamMap = new Map(teams.map((t) => [t.id.toString(), t]));

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner: project.owner_id ? userMap.get(project.owner_id.toString()) || null : null,
      team: project.team_id ? teamMap.get(project.team_id.toString()) || null : null,
      createdBy: project.created_by ? userMap.get(project.created_by.toString()) || null : null,
    };

    return sendSuccess(res, 200, "Project retrieved successfully", serializedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return sendError(res, 500, "Failed to fetch project");
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, description, owner_id, team_id, created_by, blocker } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(owner_id !== undefined && { owner_id: owner_id != null ? BigInt(owner_id) : null }),
        ...(team_id !== undefined && { team_id: team_id != null ? BigInt(team_id) : null }),
        ...(created_by !== undefined && { created_by: created_by != null ? BigInt(created_by) : null }),
        ...(blocker !== undefined && { blocker }),
        updated_at: new Date(),
      },
    });

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      owner_id: project.owner_id?.toString(),
      team_id: project.team_id?.toString(),
      created_by: project.created_by?.toString(),
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
