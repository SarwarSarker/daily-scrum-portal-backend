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

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Admin & Manager can create projects
router.post("/", authorize(Role.ADMIN, Role.MANAGER), createProject);

// All authenticated users can view projects
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Admin & Manager can update/delete projects
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), updateProject);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), deleteProject);

export default router;
