// controllers/department.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createDepartment = async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    return sendError(res, 400, "name and slug are required");
  }

  try {
    const department = await prisma.department.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
    });

    const serializedDepartment = {
      ...department,
      id: department.id.toString(),
      users: department.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      teams: department.teams.map((team: any) => ({ ...team, id: team.id.toString() })),
    };

    return sendSuccess(res, 201, "Department created successfully", serializedDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    if ((error as any).code === "P2002") {
      return sendError(res, 409, "Department with this name or slug already exists");
    }
    return sendError(res, 500, "Failed to create department");
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true },
        },
        teams: {
          select: { id: true, name: true },
          include: {
            lead: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const serializedDepartments = departments.map((department: any) => ({
      ...department,
      id: department.id.toString(),
      users: department.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      teams: department.teams.map((team: any) => ({
        ...team,
        id: team.id.toString(),
        lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
      })),
    }));

    return sendSuccess(res, 200, "Departments retrieved successfully", serializedDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return sendError(res, 500, "Failed to fetch departments");
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true, role: true },
        },
        teams: {
          include: {
            lead: { select: { id: true, name: true, email: true } },
            users: {
              select: { id: true, name: true, email: true, designation: true, status: true },
            },
            projects: {
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });

    if (!department) {
      return sendError(res, 404, "Department not found");
    }

    const serializedDepartment = {
      ...department,
      id: department.id.toString(),
      users: department.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      teams: department.teams.map((team: any) => ({
        ...team,
        id: team.id.toString(),
        departmentId: team.departmentId?.toString(),
        leadId: team.leadId?.toString(),
        lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
        users: team.users.map((user: any) => ({ ...user, id: user.id.toString() })),
        projects: team.projects.map((project: any) => ({ ...project, id: project.id.toString() })),
      })),
    };

    return sendSuccess(res, 200, "Department retrieved successfully", serializedDepartment);
  } catch (error) {
    console.error("Error fetching department:", error);
    return sendError(res, 500, "Failed to fetch department");
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  try {
    const department = await prisma.department.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(name && { name }),
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, "-") }),
        updated_at: new Date(),
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
    });

    const serializedDepartment = {
      ...department,
      id: department.id.toString(),
      users: department.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      teams: department.teams.map((team: any) => ({ ...team, id: team.id.toString() })),
    };

    return sendSuccess(res, 200, "Department updated successfully", serializedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    if ((error as any).code === "P2002") {
      return sendError(res, 409, "Department with this name or slug already exists");
    }
    return sendError(res, 500, "Failed to update department");
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.department.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Department deleted successfully");
  } catch (error) {
    console.error("Error deleting department:", error);
    return sendError(res, 500, "Failed to delete department");
  }
};
