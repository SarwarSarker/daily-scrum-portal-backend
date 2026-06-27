// routes/v1/task.routes.ts

import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  createTaskComment,
  getTaskComments,
  getTaskCommentById,
  updateTaskComment,
  deleteTaskComment,
} from "../../controllers/task.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";
import { validate, validateParams, taskIdSchema, taskAndCommentIdSchema } from "../../core/validation";
import { createTaskSchema, updateTaskSchema } from "../../core/validation/task.validator";
import { createTaskCommentSchema, updateTaskCommentSchema } from "../../core/validation/task-comment.validator";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Admin & Manager can create tasks
router.post("/", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), validate(createTaskSchema), createTask);

// All authenticated users can view tasks
router.get("/", getTasks);
router.get("/:taskId", validateParams(taskIdSchema), getTaskById);

// Admin & Manager can update/delete tasks
router.patch("/:taskId", authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD), validateParams(taskIdSchema), validate(updateTaskSchema), updateTask);
router.delete("/:taskId", authorize(Role.ADMIN, Role.MANAGER), validateParams(taskIdSchema), deleteTask);

// Task comment routes (nested under tasks)
router.post("/:taskId/comments", validateParams(taskIdSchema), validate(createTaskCommentSchema), createTaskComment);
router.get("/:taskId/comments", validateParams(taskIdSchema), getTaskComments);
router.get("/:taskId/comments/:commentId", validateParams(taskAndCommentIdSchema), getTaskCommentById);
router.patch("/:taskId/comments/:commentId", validateParams(taskAndCommentIdSchema), validate(updateTaskCommentSchema), updateTaskComment);
router.delete("/:taskId/comments/:commentId", validateParams(taskAndCommentIdSchema), deleteTaskComment);

export default router;
