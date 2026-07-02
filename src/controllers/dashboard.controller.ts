// controllers/dashboard.controller.ts

import { Request, Response } from "express";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";

// Case-insensitive equals filter (data casing is inconsistent, e.g. "Completed" vs "completed")
const ci = (value: string) => ({ equals: value, mode: "insensitive" as const });

// ISO week number + week-year for a given date
const getISOWeek = (date: Date): { year: number; week: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // shift to the Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
};

const weekKey = (date: Date): string => {
  const { year, week } = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
};

/**
 * Dashboard analytics aggregated across all tables.
 * Returns high-level stats plus the datasets that power the dashboard charts.
 */
export const getDashboard = async (_req: Request, res: Response) => {
  try {
    // Weekly trends window: the last 6 ISO weeks (including the current one)
    const now = new Date();
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 7 * 6);

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      projectStatusGroups,
      totalTasks,
      completedTasks,
      highPriorityTasks,
      progressAgg,
      priorityGroups,
      teams,
      projectsWithTeam,
      plannedPerProject,
      deliveredPerProject,
      createdTasks,
      completedTaskDates,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: ci("in_progress") } }),
      prisma.project.count({ where: { status: ci("completed") } }),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: ci("completed") } }),
      prisma.task.count({ where: { priority: ci("high") } }),
      prisma.task.aggregate({ _avg: { progress: true } }),
      prisma.task.groupBy({ by: ["priority"], _count: { _all: true } }),
      prisma.team.findMany({ select: { id: true, name: true } }),
      prisma.project.findMany({
        where: { team_id: { not: null } },
        select: { id: true, team_id: true },
      }),
      prisma.task.groupBy({ by: ["project_id"], _count: { _all: true } }),
      prisma.task.groupBy({
        by: ["project_id"],
        where: { status: ci("completed") },
        _count: { _all: true },
      }),
      prisma.task.findMany({
        where: { created_at: { gte: sixWeeksAgo } },
        select: { created_at: true },
      }),
      prisma.task.findMany({
        where: { status: ci("completed"), updated_at: { gte: sixWeeksAgo } },
        select: { updated_at: true },
      }),
    ]);

    const averageProgress = Math.round(progressAgg._avg.progress ?? 0);
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Donut: project counts grouped by status (casing normalized so "Completed"/"completed" merge)
    const projectStatusBreakdown: Record<string, number> = {};
    for (const group of projectStatusGroups) {
      const key = (group.status ?? "unknown").toLowerCase();
      projectStatusBreakdown[key] = (projectStatusBreakdown[key] ?? 0) + group._count._all;
    }

    // Risk distribution: task counts grouped by priority (casing normalized)
    const priorityDistribution: Record<string, number> = {};
    for (const group of priorityGroups) {
      const key = (group.priority ?? "unknown").toLowerCase();
      priorityDistribution[key] = (priorityDistribution[key] ?? 0) + group._count._all;
    }

    // Team performance: planned (total tasks) vs delivered (completed tasks) per team,
    // rolled up through project -> team.
    const projectTeamMap = new Map<string, string>();
    for (const project of projectsWithTeam) {
      if (project.team_id) projectTeamMap.set(project.id.toString(), project.team_id.toString());
    }

    const plannedByProject = new Map<string, number>();
    for (const row of plannedPerProject) plannedByProject.set(row.project_id.toString(), row._count._all);

    const deliveredByProject = new Map<string, number>();
    for (const row of deliveredPerProject) deliveredByProject.set(row.project_id.toString(), row._count._all);

    const teamStats = new Map<string, { planned: number; delivered: number }>();
    for (const [projectId, teamId] of projectTeamMap) {
      const stats = teamStats.get(teamId) ?? { planned: 0, delivered: 0 };
      stats.planned += plannedByProject.get(projectId) ?? 0;
      stats.delivered += deliveredByProject.get(projectId) ?? 0;
      teamStats.set(teamId, stats);
    }

    const teamPerformance = teams.map((team) => {
      const stats = teamStats.get(team.id.toString()) ?? { planned: 0, delivered: 0 };
      return {
        team: { id: team.id.toString(), name: team.name },
        planned: stats.planned,
        delivered: stats.delivered,
      };
    });

    // Weekly task trends: created vs completed for the last 6 weeks.
    // NOTE: tasks have no completion timestamp, so "completed" is bucketed by updated_at.
    const weekBuckets = new Map<string, { created: number; completed: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - 7 * i);
      const key = weekKey(d);
      if (!weekBuckets.has(key)) weekBuckets.set(key, { created: 0, completed: 0 });
    }
    for (const task of createdTasks) {
      const bucket = weekBuckets.get(weekKey(task.created_at));
      if (bucket) bucket.created += 1;
    }
    for (const task of completedTaskDates) {
      const bucket = weekBuckets.get(weekKey(task.updated_at));
      if (bucket) bucket.completed += 1;
    }
    const taskTrends = [...weekBuckets.entries()].map(([week, counts]) => ({ week, ...counts }));

    const dashboard = {
      stats: {
        totalProjects,
        activeProjects, // projects with status = in_progress
        completedProjects,
        averageProgress, // percent (avg of task progress)
        totalTasks,
        completedTasks,
        highPriorityTasks, // tasks with priority = high
        taskCompletionRate, // percent of tasks completed
      },
      projectCompletion: {
        total: totalProjects,
        breakdown: projectStatusBreakdown, // { planning, in_progress, on_hold, completed, ... }
      },
      teamPerformance, // [{ team: { id, name }, planned, delivered }]
      riskDistribution: priorityDistribution, // { low, medium, high }
      taskTrends, // [{ week: "2026-W23", created, completed }]
    };

    return sendSuccess(res, 200, "Dashboard data retrieved successfully", dashboard);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return sendError(res, 500, "Failed to fetch dashboard data");
  }
};
