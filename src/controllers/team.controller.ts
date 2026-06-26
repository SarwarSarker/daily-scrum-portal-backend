// controllers/team.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createTeam = async (req: Request, res: Response) => {
  const { name, department_id, lead_id } = req.body;

  if (!name) {
    return sendError(res, 400, "name is required");
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        departmentId: department_id ? BigInt(department_id) : null,
        leadId: lead_id ? BigInt(lead_id) : null,
      },
      include: {
        department: { select: { id: true, name: true, slug: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    const serializedTeam = {
      ...team,
      id: team.id.toString(),
      department_id: team.department_id?.toString(),
      lead_id: team.lead_id?.toString(),
      department: team.department ? { ...team.department, id: team.department.id.toString() } : null,
      lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
    };

    return sendSuccess(res, 201, "Team created successfully", serializedTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return sendError(res, 500, "Failed to create team");
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const { department_id } = req.query;

    const where: any = {};
    if (department_id) where.departmentId = BigInt(department_id as string);

    const teams = await prisma.team.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, slug: true } },
        lead: { select: { id: true, name: true, email: true } },
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true },
        },
        projects: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const serializedTeams = teams.map((team: any) => ({
      ...team,
      id: team.id.toString(),
      departmentId: team.departmentId?.toString(),
      leadId: team.leadId?.toString(),
      department: team.department ? { ...team.department, id: team.department.id.toString() } : null,
      lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
      users: team.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      projects: team.projects.map((project: any) => ({ ...project, id: project.id.toString() })),
    }));

    return sendSuccess(res, 200, "Teams retrieved successfully", serializedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return sendError(res, 500, "Failed to fetch teams");
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const team = await prisma.team.findUnique({
      where: { id: BigInt(toString(id)) },
      include: {
        department: { select: { id: true, name: true, slug: true } },
        lead: { select: { id: true, name: true, email: true } },
        users: {
          select: { id: true, name: true, email: true, designation: true, status: true },
        },
        projects: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!team) {
      return sendError(res, 404, "Team not found");
    }

    const serializedTeam = {
      ...team,
      id: team.id.toString(),
      department_id: team.department_id?.toString(),
      lead_id: team.lead_id?.toString(),
      department: team.department ? { ...team.department, id: team.department.id.toString() } : null,
      lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
      users: team.users.map((user: any) => ({ ...user, id: user.id.toString() })),
      projects: team.projects.map((project: any) => ({
        ...project,
        id: project.id.toString(),
        owner_id: project.owner_id.toString(),
        team_id: project.team_id.toString(),
        created_by: project.created_by.toString(),
        owner: project.owner ? { ...project.owner, id: project.owner.id.toString() } : null,
        creator: project.creator ? { ...project.creator, id: project.creator.id.toString() } : null,
      })),
    };

    return sendSuccess(res, 200, "Team retrieved successfully", serializedTeam);
  } catch (error) {
    console.error("Error fetching team:", error);
    return sendError(res, 500, "Failed to fetch team");
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, department_id, lead_id } = req.body;

  try {
    const team = await prisma.team.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(name && { name }),
        ...(department_id !== undefined && { departmentId: department_id ? BigInt(department_id) : null }),
        ...(lead_id !== undefined && { leadId: lead_id ? BigInt(lead_id) : null }),
        updated_at: new Date(),
      },
      include: {
        department: { select: { id: true, name: true, slug: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    const serializedTeam = {
      ...team,
      id: team.id.toString(),
      department_id: team.department_id?.toString(),
      lead_id: team.lead_id?.toString(),
      department: team.department ? { ...team.department, id: team.department.id.toString() } : null,
      lead: team.lead ? { ...team.lead, id: team.lead.id.toString() } : null,
    };

    return sendSuccess(res, 200, "Team updated successfully", serializedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return sendError(res, 500, "Failed to update team");
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.team.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "Team deleted successfully");
  } catch (error) {
    console.error("Error deleting team:", error);
    return sendError(res, 500, "Failed to delete team");
  }
};
