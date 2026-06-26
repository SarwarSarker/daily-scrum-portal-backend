// controllers/user.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, department_id, team_id } = req.query;

    const where: any = {};
    if (role) where.role = role as string;
    if (status) where.status = status as string;
    if (department_id) where.departmentId = BigInt(department_id as string);
    if (team_id) where.teamId = BigInt(team_id as string);

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teamId: true,
        departmentId: true,
        team: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
            projectUpdates: true,
            taskComments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedUsers = users.map((user: any) => ({
      ...user,
      id: user.id.toString(),
      teamId: user.teamId?.toString(),
      departmentId: user.departmentId?.toString(),
      team: user.team ? { ...user.team, id: user.team.id.toString() } : null,
      department: user.department ? { ...user.department, id: user.department.id.toString() } : null,
    }));

    return sendSuccess(res, 200, "Users retrieved successfully", serializedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return sendError(res, 500, "Failed to fetch users");
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(toString(id)) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teamId: true,
        departmentId: true,
        team: {
          select: { id: true, name: true, department: { select: { id: true, name: true } } },
        },
        department: {
          select: { id: true, name: true, slug: true },
        },
        assignedTasks: {
          include: {
            project: { select: { id: true, title: true } },
          },
        },
        createdTasks: {
          include: {
            project: { select: { id: true, title: true } },
          },
        },
        projectUpdates: {
          include: {
            project: { select: { id: true, title: true } },
          },
          orderBy: { update_date: "desc" },
        },
        taskComments: {
          include: {
            task: { select: { id: true, title: true } },
          },
          orderBy: { created_at: "desc" },
        },
        ownedProjects: {
          select: { id: true, title: true, status: true },
        },
        createdProjects: {
          select: { id: true, title: true, status: true },
        },
        ledTeams: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const serializedUser = {
      ...user,
      id: user.id.toString(),
      teamId: user.teamId?.toString(),
      departmentId: user.departmentId?.toString(),
      team: user.team ? { ...user.team, id: user.team.id.toString(), department: user.team.department ? { ...user.team.department, id: user.team.department.id.toString() } : null } : null,
      department: user.department ? { ...user.department, id: user.department.id.toString() } : null,
      assignedTasks: user.assignedTasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        project_id: task.project_id.toString(),
        assigned_to: task.assigned_to?.toString(),
        created_by: task.created_by.toString(),
        project: task.project ? { ...task.project, id: task.project.id.toString() } : null,
      })),
      createdTasks: user.createdTasks.map((task: any) => ({
        ...task,
        id: task.id.toString(),
        project_id: task.project_id.toString(),
        assigned_to: task.assigned_to?.toString(),
        created_by: task.created_by.toString(),
        project: task.project ? { ...task.project, id: task.project.id.toString() } : null,
      })),
      projectUpdates: user.projectUpdates.map((update: any) => ({
        ...update,
        id: update.id.toString(),
        project_id: update.project_id.toString(),
        updated_by: update.updated_by.toString(),
        project: update.project ? { ...update.project, id: update.project.id.toString() } : null,
      })),
      taskComments: user.taskComments.map((comment: any) => ({
        ...comment,
        id: comment.id.toString(),
        task_id: comment.task_id.toString(),
        user_id: comment.user_id.toString(),
        task: comment.task ? { ...comment.task, id: comment.task.id.toString() } : null,
      })),
      ownedProjects: user.ownedProjects.map((project: any) => ({
        ...project,
        id: project.id.toString(),
        owner_id: project.owner_id.toString(),
        team_id: project.team_id.toString(),
        created_by: project.created_by.toString(),
      })),
      createdProjects: user.createdProjects.map((project: any) => ({
        ...project,
        id: project.id.toString(),
        owner_id: project.owner_id.toString(),
        team_id: project.team_id.toString(),
        created_by: project.created_by.toString(),
      })),
      ledTeams: user.ledTeams.map((team: any) => ({ ...team, id: team.id.toString() })),
    };

    return sendSuccess(res, 200, "User retrieved successfully", serializedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendError(res, 500, "Failed to fetch user");
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, designation, avatar, team_id, department_id, status, password } = req.body;

  try {
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(designation !== undefined && { designation }),
      ...(avatar !== undefined && { avatar }),
      ...(team_id !== undefined && { teamId: team_id ? BigInt(team_id) : null }),
      ...(department_id !== undefined && { departmentId: department_id ? BigInt(department_id) : null }),
      ...(status && { status }),
      updated_at: new Date(),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: BigInt(toString(id)) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teamId: true,
        departmentId: true,
        team: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, slug: true } },
      },
    });

    const serializedUser = {
      ...user,
      id: user.id.toString(),
      teamId: user.teamId?.toString(),
      departmentId: user.departmentId?.toString(),
      team: user.team ? { ...user.team, id: user.team.id.toString() } : null,
      department: user.department ? { ...user.department, id: user.department.id.toString() } : null,
    };

    return sendSuccess(res, 200, "User updated successfully", serializedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if ((error as any).code === "P2002") {
      return sendError(res, 409, "Email already exists");
    }
    return sendError(res, 500, "Failed to update user");
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: BigInt(toString(id)) },
    });

    return sendSuccess(res, 200, "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendError(res, 500, "Failed to delete user");
  }
};
