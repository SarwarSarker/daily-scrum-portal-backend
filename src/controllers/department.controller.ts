// controllers/department.controller.ts

import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../configs/database";
import { sendSuccess, sendError } from "../utlis/response";
import { slugify } from "../utlis/helper";

export const createDepartment = async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  if (!name) {
    return sendError(res, 400, "name is required");
  }

  const finalSlug = slugify(slug ?? name);
  if (!finalSlug) {
    return sendError(res, 400, "A valid name or slug is required");
  }

  try {
    const department = await prisma.departments.create({
      data: { name, slug: finalSlug },
    });
    return sendSuccess(res, 201, "Department created successfully", department);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return sendError(res, 409, "A department with that name or slug already exists");
    }
    throw err;
  }
};

export const listDepartments = async (_req: Request, res: Response) => {
  const departments = await prisma.departments.findMany({
    orderBy: { name: "asc" },
  });
  return sendSuccess(res, 200, "Departments fetched successfully", departments);
};

export const getDepartment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  const department = await prisma.departments.findUnique({
    where: { id },
    include: { teams: true },
  });

  if (!department) {
    return sendError(res, 404, "Department not found");
  }

  return sendSuccess(res, 200, "Department fetched successfully", department);
};

export const updateDepartment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));
  const { name, slug } = req.body;

  if (name === undefined && slug === undefined) {
    return sendError(res, 400, "Provide name or slug to update");
  }

  const data: Prisma.departmentsUpdateInput = { updated_at: new Date() };
  if (name !== undefined) data.name = name;
  if (slug !== undefined || name !== undefined) {
    const finalSlug = slugify(slug ?? name);
    if (!finalSlug) {
      return sendError(res, 400, "A valid name or slug is required");
    }
    data.slug = finalSlug;
  }

  try {
    const department = await prisma.departments.update({ where: { id }, data });
    return sendSuccess(res, 200, "Department updated successfully", department);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return sendError(res, 404, "Department not found");
      if (err.code === "P2002")
        return sendError(res, 409, "A department with that name or slug already exists");
    }
    throw err;
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const id = BigInt(String(req.params.id));

  try {
    await prisma.departments.delete({ where: { id } });
    return sendSuccess(res, 200, "Department deleted successfully");
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return sendError(res, 404, "Department not found");
    }
    throw err;
  }
};
