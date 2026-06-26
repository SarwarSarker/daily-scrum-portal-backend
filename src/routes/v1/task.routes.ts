// routes/v1/task.routes.ts

import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../../controllers/task.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Admin & Manager can create tasks
router.post("/", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), createTask);

// All authenticated users can view tasks
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Admin & Manager can update/delete tasks
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), updateTask);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), deleteTask);

export default router;
