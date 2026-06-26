// routes/v1/project.routes.ts

import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../../controllers/project.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";
import { validate, validateParams, idSchema } from "../../core/validation";
import { createProjectSchema, updateProjectSchema } from "../../core/validation/project.validator";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Admin & Manager can create projects
router.post("/", authorize(Role.ADMIN, Role.MANAGER), validate(createProjectSchema), createProject);

// All authenticated users can view projects
router.get("/", getProjects);
router.get("/:id", validateParams(idSchema), getProjectById);

// Admin & Manager can update/delete projects
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), validate(updateProjectSchema), updateProject);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), deleteProject);

export default router;
