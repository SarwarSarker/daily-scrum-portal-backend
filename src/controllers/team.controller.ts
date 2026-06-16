// controllers/team.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../database";
import { sendSuccess, sendError } from "../utlis/response";

export const createTeam = async (req: Request, res: Response) => {
  const { name, department_id, lead_id } = req.body;

  if (!name) {
    return sendError(res, 400, "name is required");
  }

  try {
    const team = await prisma.teams.create({
      data: {
        name,
        department_id: department_id != null ? BigInt(department_id) : undefined,
        lead_id: lead_id != null ? BigInt(lead_id) : undefined,
      },
    });
    return sendSuccess(res, 201, "Team created successfully", team);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002")
        return sendError(res, 409, "A team with that name already exists in this department");
      if (err.code === "P2003")
        return sendError(res, 400, "Invalid department_id or lead_id");
    }
    throw err;
  }
};

export const listTeams = async (req: Request, res: Response) => {
  const { department_id } = req.query;

  const teams = await prisma.teams.findMany({
    where:
      department_id != null
        ? { department_id: BigInt(department_id as string) }
        : undefined,
    include: {
      departments: true,
      users: { select: { id: true, name: true, email: true } },
    },
    orderBy: { name: "asc" },
  });

  return sendSuccess(res, 200, "Teams fetched successfully", teams);
};

export const getTeam = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const team = await prisma.teams.findUnique({
    where: { id },
    include: {
      departments: true,
      users: { select: { id: true, name: true, email: true } },
    },
  });

  if (!team) {
    return sendError(res, 404, "Team not found");
  }

  return sendSuccess(res, 200, "Team fetched successfully", team);
};

export const updateTeam = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));
  const { name, department_id, lead_id } = req.body;

  if (name === undefined && department_id === undefined && lead_id === undefined) {
    return sendError(res, 400, "Provide name, department_id or lead_id to update");
  }

  const data: Prisma.teamsUpdateInput = { updated_at: new Date() };
  if (name !== undefined) data.name = name;
  if (department_id !== undefined) {
    data.departments =
      department_id != null
        ? { connect: { id: BigInt(department_id) } }
        : { disconnect: true };
  }
  if (lead_id !== undefined) {
    data.users =
      lead_id != null ? { connect: { id: BigInt(lead_id) } } : { disconnect: true };
  }

  try {
    const team = await prisma.teams.update({ where: { id }, data });
    return sendSuccess(res, 200, "Team updated successfully", team);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Team not found");
      if (err.code === "P2002")
        return sendError(res, 409, "A team with that name already exists in this department");
      if (err.code === "P2003")
        return sendError(res, 400, "Invalid department_id or lead_id");
    }
    throw err;
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  try {
    await prisma.teams.delete({ where: { id } });
    return sendSuccess(res, 200, "Team deleted successfully");
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Team not found");
    }
    throw err;
  }
};
