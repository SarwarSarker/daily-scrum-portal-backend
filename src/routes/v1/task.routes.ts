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
import { validate, validateParams, idSchema } from "../../core/validation";
import { createTaskSchema, updateTaskSchema } from "../../core/validation/task.validator";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Admin & Manager can create tasks
router.post("/", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), validate(createTaskSchema), createTask);

// All authenticated users can view tasks
router.get("/", getTasks);
router.get("/:id", validateParams(idSchema), getTaskById);

// Admin & Manager can update/delete tasks
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), validateParams(idSchema), validate(updateTaskSchema), updateTask);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), deleteTask);

export default router;
