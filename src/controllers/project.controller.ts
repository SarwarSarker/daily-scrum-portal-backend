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

    console.log("Debug - Total projects:", projects.length);

    // Collect all unique owner IDs, team IDs, and created_by IDs
    const ownerIds = [...new Set(projects.map((p) => p.owner_id).filter(Boolean))] as bigint[];
    const teamIds = [...new Set(projects.map((p) => p.team_id).filter(Boolean))] as bigint[];
    const createdByIds = [...new Set(projects.map((p) => p.created_by).filter(Boolean))] as bigint[];
    const projectIds = projects.map((p) => p.id);

    // Distinct task assignees per project (the members working on each project)
    const taskAssignees =
      projectIds.length > 0
        ? await prisma.task.findMany({
            where: {
              project_id: { in: projectIds },
              assigned_to: { not: null },
            },
            select: {
              project_id: true,
              assigned_to: true,
            },
            distinct: ["project_id", "assigned_to"],
          })
        : [];

    const assigneeIds = [...new Set(taskAssignees.map((t) => t.assigned_to).filter(Boolean))] as bigint[];

    // Fetch referenced users, teams, task stats (total + avg progress), and completed counts in parallel
    const allUserIds = [...new Set([...ownerIds, ...createdByIds, ...assigneeIds])];
    const [users, teams, taskStatsRows, completedRows] = await Promise.all([
      allUserIds.length > 0
        ? prisma.user.findMany({
            where: {
              id: { in: allUserIds },
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
      projectIds.length > 0
        ? prisma.task.groupBy({
            by: ["project_id"],
            where: {
              project_id: { in: projectIds },
            },
            _avg: {
              progress: true,
            },
            _count: {
              _all: true,
            },
          })
        : [],
      projectIds.length > 0
        ? prisma.task.groupBy({
            by: ["project_id"],
            where: {
              project_id: { in: projectIds },
              status: { equals: "completed", mode: "insensitive" },
            },
            _count: {
              _all: true,
            },
          })
        : [],
    ]);

    // Create maps for easy lookup
    const userMap = new Map(users.map((u) => [u.id.toString(), u]));
    const teamMap = new Map(teams.map((t) => [t.id.toString(), t]));

    // Per-project progress (avg of task progress) and total task count
    const progressMap = new Map<string, number>();
    const totalTaskMap = new Map<string, number>();
    for (const row of taskStatsRows) {
      const key = row.project_id.toString();
      progressMap.set(key, Math.round(row._avg.progress ?? 0));
      totalTaskMap.set(key, row._count._all);
    }

    // Per-project completed task count
    const completedTaskMap = new Map<string, number>();
    for (const row of completedRows) {
      completedTaskMap.set(row.project_id.toString(), row._count._all);
    }

    // Build the member list (id, name, avatar) for each project from distinct assignees
    const membersMap = new Map<string, Array<{ id: bigint; name: string | null; avatar: string | null }>>();
    for (const task of taskAssignees) {
      if (!task.assigned_to) continue;
      const member = userMap.get(task.assigned_to.toString());
      if (!member) continue;
      const key = task.project_id.toString();
      const list = membersMap.get(key) ?? [];
      list.push(member);
      membersMap.set(key, list);
    }

    const serializedProjects = projects.map((project: any) => {
      const teamId = project.team_id?.toString();
      const team = teamId ? teamMap.get(teamId) || null : null;

      const { owner_id, team_id, created_by, ...projectFields } = project;

      const projectKey = project.id.toString();
      const members = membersMap.get(projectKey) ?? [];
      const totalTasks = totalTaskMap.get(projectKey) ?? 0;
      const completedTasks = completedTaskMap.get(projectKey) ?? 0;

      return {
        ...projectFields,
        id: project.id.toString(),
        owner: project.owner_id ? userMap.get(project.owner_id.toString()) || null : null,
        team: team,
        createdBy: project.created_by ? userMap.get(project.created_by.toString()) || null : null,
        progress: progressMap.get(projectKey) ?? 0,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          remaining: totalTasks - completedTasks,
        },
        memberCount: members.length,
        members: members,
      };
    });

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

    // Distinct task assignees for this project (the members working on it)
    const projectAssignees = await prisma.task.findMany({
      where: {
        project_id: project.id,
        assigned_to: { not: null },
      },
      select: {
        assigned_to: true,
      },
      distinct: ["assigned_to"],
    });

    const assigneeIds = projectAssignees.map((t) => t.assigned_to).filter(Boolean) as bigint[];

    // Fetch related users (owner, creator, members) and team in parallel
    const userIds = [...new Set([project.owner_id, project.created_by, ...assigneeIds].filter(Boolean))] as bigint[];
    const teamIds = project.team_id ? [project.team_id] : [];

    const [users, teams, progressAgg, completedTasks] = await Promise.all([
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
      prisma.task.aggregate({
        where: {
          project_id: project.id,
        },
        _avg: {
          progress: true,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.task.count({
        where: {
          project_id: project.id,
          status: { equals: "completed", mode: "insensitive" },
        },
      }),
    ]);

    // Create maps for easy lookup
    const userMap = new Map(users.map((u) => [u.id.toString(), u]));
    const teamMap = new Map(teams.map((t) => [t.id.toString(), t]));

    // Project progress = average progress of its tasks (0 when it has no tasks)
    const progress = Math.round(progressAgg._avg.progress ?? 0);

    // Task counts for this project
    const totalTasks = progressAgg._count._all;
    const taskStats = {
      total: totalTasks,
      completed: completedTasks,
      remaining: totalTasks - completedTasks,
    };

    // Members (id, name, avatar) working on this project
    const members = assigneeIds
      .map((assigneeId) => userMap.get(assigneeId.toString()))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));

    const teamId = project.team_id?.toString();
    const team = teamId ? teamMap.get(teamId) || null : null;

    const { owner_id, team_id, created_by, ...projectFields } = project;

    const serializedProject = {
      ...projectFields,
      id: project.id.toString(),
      owner: project.owner_id ? userMap.get(project.owner_id.toString()) || null : null,
      team: team,
      createdBy: project.created_by ? userMap.get(project.created_by.toString()) || null : null,
      progress: progress,
      taskStats: taskStats,
      memberCount: members.length,
      members: members,
    };

    return sendSuccess(res, 200, "Project retrieved successfully", serializedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return sendError(res, 500, "Failed to fetch project");
  }
};

// Get all tasks that belong to a project
export const getProjectTasks = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    const projectId = BigInt(toString(id));

    // Ensure the project exists so we can return a clear 404 (and reuse its name)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    });

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const where: any = { project_id: projectId };
    if (status) where.status = status as string;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    // Resolve assigned_to / created_by into user details (id, name, avatar)
    const userIds = [
      ...new Set(
        [
          ...tasks.map((t) => t.assigned_to),
          ...tasks.map((t) => t.created_by),
        ].filter(Boolean)
      ),
    ] as bigint[];

    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, avatar: true },
          })
        : [];

    const userMap = new Map(users.map((u) => [u.id.toString(), u]));

    const serializedProject = { id: project.id.toString(), name: project.name };

    const serializedTasks = tasks.map((task: any) => {
      const { project_id, assigned_to, created_by, ...taskFields } = task;

      return {
        ...taskFields,
        id: task.id.toString(),
        project: serializedProject,
        assigned_to: task.assigned_to ? userMap.get(task.assigned_to.toString()) || null : null,
        created_by: task.created_by ? userMap.get(task.created_by.toString()) || null : null,
        start_date: task.start_date?.toISOString() ?? null,
        end_date: task.end_date?.toISOString() ?? null,
      };
    });

    return sendSuccess(res, 200, "Project tasks retrieved successfully", serializedTasks);
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return sendError(res, 500, "Failed to fetch project tasks");
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
