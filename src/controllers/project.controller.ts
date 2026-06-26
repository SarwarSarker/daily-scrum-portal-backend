// controllers/project.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createProject = async (req: Request, res: Response) => {
  const { name, status, description, start_date, end_date } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        status: status ?? "planning",
        description,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      start_date: project.start_date?.toISOString(),
      end_date: project.end_date?.toISOString(),
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
        tasks: true,
        projectUpdates: true,
      },
      orderBy: { created_at: "desc" },
    });

    const serializedProjects = projects.map((project: any) => ({
      ...project,
      id: project.id.toString(),
      start_date: project.start_date?.toISOString(),
      end_date: project.end_date?.toISOString(),
      tasks: project.tasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        project_id: task.project_id.toString(),
        assigned_to: task.assigned_to?.toString(),
        due_date: task.due_date?.toISOString(),
      })),
      projectUpdates: project.projectUpdates.map((update: any) => ({
        ...update,
        id: update.id.toString(),
        project_id: update.project_id.toString(),
        updated_by: update.updated_by.toString(),
        update_date: update.update_date.toISOString(),
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
        tasks: {
          orderBy: { created_at: "desc" },
        },
        projectUpdates: {
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
      start_date: project.start_date?.toISOString(),
      end_date: project.end_date?.toISOString(),
      tasks: project.tasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        project_id: task.project_id.toString(),
        assigned_to: task.assigned_to?.toString(),
        due_date: task.due_date?.toISOString(),
      })),
      projectUpdates: project.projectUpdates.map((update: any) => ({
        ...update,
        id: update.id.toString(),
        project_id: update.project_id.toString(),
        updated_by: update.updated_by.toString(),
        update_date: update.update_date.toISOString(),
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
  const { name, status, description, start_date, end_date } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(start_date !== undefined && { start_date: start_date ? new Date(start_date) : null }),
        ...(end_date !== undefined && { end_date: end_date ? new Date(end_date) : null }),
        updated_at: new Date(),
      },
    });

    const serializedProject = {
      ...project,
      id: project.id.toString(),
      start_date: project.start_date?.toISOString(),
      end_date: project.end_date?.toISOString(),
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
