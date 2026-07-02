// controllers/team.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const createTeam = async (req: Request, res: Response) => {
  const { name, lead_id } = req.body;
  console.log("🚀 ~ createTeam ~ lead_id:", lead_id)
  console.log("🚀 ~ createTeam ~ name:", name)

  try {
    const team = await prisma.team.create({
      data: {
        name,
        lead_id: lead_id ? BigInt(lead_id) : null,
      },
    });

    const lead = team.lead_id
      ? await prisma.user.findUnique({
          where: { id: team.lead_id },
          select: { id: true, name: true, avatar: true },
        })
      : null;

    const { lead_id: _createdLeadId, ...restTeam } = team;
    const serializedTeam = {
      ...restTeam,
      id: team.id.toString(),
      lead: lead
        ? { id: lead.id.toString(), name: lead.name, avatar: lead.avatar }
        : null,
    };

    return sendSuccess(res, 201, "Team created successfully", serializedTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return sendError(res, 500, "Failed to create team");
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { id: "asc" },
    });

    const teamIds = teams.map((team) => team.id);
    const leadIds = teams
      .map((team) => team.lead_id)
      .filter((id): id is bigint => id != null);

    // Batch-load members, leads and project status counts for all teams (avoids N+1)
    const [members, leads, projectCounts] = await Promise.all([
      prisma.user.findMany({
        where: { teamId: { in: teamIds } },
        select: { id: true, name: true, avatar: true, teamId: true },
      }),
      prisma.user.findMany({
        where: { id: { in: leadIds } },
        select: { id: true, name: true, avatar: true },
      }),
      prisma.project.groupBy({
        by: ["team_id", "status"],
        where: { team_id: { in: teamIds } },
        _count: true,
      }),
    ]);

    // Index leads by their id for quick lookup
    const leadsById = new Map<string, { id: string; name: string | null; avatar: string | null }>();
    for (const lead of leads) {
      leadsById.set(lead.id.toString(), {
        id: lead.id.toString(),
        name: lead.name,
        avatar: lead.avatar,
      });
    }

    // Group members by their team
    const membersByTeam = new Map<string, Array<{ id: string; name: string | null; avatar: string | null }>>();
    for (const member of members) {
      const key = member.teamId!.toString();
      const list = membersByTeam.get(key) ?? [];
      list.push({ id: member.id.toString(), name: member.name, avatar: member.avatar });
      membersByTeam.set(key, list);
    }

    // Aggregate project counts (completed vs total) by team
    const projectStatsByTeam = new Map<string, { completed: number; total: number }>();
    for (const row of projectCounts) {
      const key = row.team_id!.toString();
      const stats = projectStatsByTeam.get(key) ?? { completed: 0, total: 0 };
      stats.total += row._count;
      if (row.status === "completed") stats.completed += row._count;
      projectStatsByTeam.set(key, stats);
    }

    const serializedTeams = teams.map((team) => {
      const { lead_id, ...rest } = team;
      const key = team.id.toString();
      const stats = projectStatsByTeam.get(key) ?? { completed: 0, total: 0 };
      return {
        ...rest,
        id: team.id.toString(),
        lead: lead_id ? leadsById.get(lead_id.toString()) ?? null : null,
        members: membersByTeam.get(key) ?? [],
        projects: {
          completed: stats.completed,
          remaining: stats.total - stats.completed,
          total: stats.total,
        },
      };
    });

    return sendSuccess(res, 200, "Teams retrieved successfully", serializedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return sendError(res, 500, "Failed to fetch teams");
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const teamId = BigInt(toString(id));

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return sendError(res, 404, "Team not found");
    }

    const [members, lead, projectCounts] = await Promise.all([
      prisma.user.findMany({
        where: { teamId },
        select: { id: true, name: true, avatar: true },
      }),
      team.lead_id
        ? prisma.user.findUnique({
            where: { id: team.lead_id },
            select: { id: true, name: true, avatar: true },
          })
        : null,
      prisma.project.groupBy({
        by: ["status"],
        where: { team_id: teamId },
        _count: true,
      }),
    ]);

    const total = projectCounts.reduce((sum, row) => sum + row._count, 0);
    const completed = projectCounts
      .filter((row) => row.status === "completed")
      .reduce((sum, row) => sum + row._count, 0);

    const { lead_id, ...restTeam } = team;
    const serializedTeam = {
      ...restTeam,
      id: team.id.toString(),
      lead: lead
        ? { id: lead.id.toString(), name: lead.name, avatar: lead.avatar }
        : null,
      members: members.map((member) => ({
        id: member.id.toString(),
        name: member.name,
        avatar: member.avatar,
      })),
      projects: {
        completed,
        remaining: total - completed,
        total,
      },
    };

    return sendSuccess(res, 200, "Team retrieved successfully", serializedTeam);
  } catch (error) {
    console.error("Error fetching team:", error);
    return sendError(res, 500, "Failed to fetch team");
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, lead_id } = req.body;

  try {
    // First check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: BigInt(toString(id)) },
    });

    if (!existingTeam) {
      return sendError(res, 404, "Team not found");
    }

    const team = await prisma.team.update({
      where: { id: BigInt(toString(id)) },
      data: {
        ...(name && { name }),
        ...(lead_id !== undefined && { lead_id: lead_id ? BigInt(lead_id) : null }),
        updated_at: new Date(),
      },
    });

    const lead = team.lead_id
      ? await prisma.user.findUnique({
          where: { id: team.lead_id },
          select: { id: true, name: true, avatar: true },
        })
      : null;

    const { lead_id: _updatedLeadId, ...restTeam } = team;
    const serializedTeam = {
      ...restTeam,
      id: team.id.toString(),
      lead: lead
        ? { id: lead.id.toString(), name: lead.name, avatar: lead.avatar }
        : null,
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
