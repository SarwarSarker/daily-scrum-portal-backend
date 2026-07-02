// controllers/user.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { toString } from "../utlis/helper";
import { Role } from "../utlis/role";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, designation, avatar, team_id, status } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return sendError(res, 409, "Email already registered");
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: role ?? Role.EMPLOYEE,
        designation,
        avatar,
        teamId: team_id != null ? BigInt(team_id) : undefined,
        status: status ?? "active",
      },
    });

    const serializedUser = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      status: user.status,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
      teamId: user.teamId?.toString(),    };

    return sendSuccess(res, 201, "User created successfully", serializedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return sendError(res, 500, "Failed to create user");
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, team_id } = req.query;

    // Pagination: default 10 per page (page 1 -> 1-10, page 2 -> 11-20, ...)
    const pageParam = parseInt(req.query.page as string, 10);
    const limitParam = parseInt(req.query.limit as string, 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 10 : Math.min(limitParam, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role as string;
    if (status) where.status = status as string;
    if (team_id) where.teamId = BigInt(team_id as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          designation: true,
          avatar: true,
          status: true,
          teamId: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const serializedUsers = users.map((user: any) => ({
      ...user,
      id: user.id.toString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 200, "Users retrieved successfully", {
      items: serializedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return sendError(res, 500, "Failed to fetch users");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  // Get user ID from JWT token (set by auth middleware)
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, 401, "Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
        teamId: true,      },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const serializedUser: any = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      status: user.status,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
      teamId: user.teamId?.toString(),    };

    return sendSuccess(res, 200, "Profile retrieved successfully", serializedUser);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return sendError(res, 500, "Failed to fetch profile");
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
        created_at: true,
        updated_at: true,
        teamId: true,      },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const serializedUser: any = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      status: user.status,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
      teamId: user.teamId?.toString(),    };

    return sendSuccess(res, 200, "User retrieved successfully", serializedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendError(res, 500, "Failed to fetch user");
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, designation, avatar, team_id, status, password } = req.body;

  try {
    const updateData: any = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(designation !== undefined && { designation }),
      ...(avatar !== undefined && { avatar }),
      ...(team_id !== undefined && { teamId: team_id ? BigInt(team_id) : null }),
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
        created_at: true,
        updated_at: true,
        teamId: true,      },
    });

    const serializedUser: any = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      status: user.status,
      created_at: user.created_at?.toISOString(),
      updated_at: user.updated_at?.toISOString(),
      teamId: user.teamId?.toString(),    };

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
