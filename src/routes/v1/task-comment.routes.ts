// routes/v1/task-comment.routes.ts

import { Router } from "express";
import {
  createTaskComment,
  getTaskComments,
  getTaskCommentById,
  updateTaskComment,
  deleteTaskComment,
} from "../../controllers/task-comment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate, validateParams, idSchema } from "../../core/validation";
import { createTaskCommentSchema, updateTaskCommentSchema } from "../../core/validation/task-comment.validator";

const router = Router();

// All task comment routes require authentication
router.use(authenticate);

// All authenticated users can create task comments
router.post("/", validate(createTaskCommentSchema), createTaskComment);

// All authenticated users can view task comments
router.get("/", getTaskComments);
router.get("/:id", validateParams(idSchema), getTaskCommentById);

// Users can update their own task comments
router.patch("/:id", validateParams(idSchema), validate(updateTaskCommentSchema), updateTaskComment);

// Users can delete their own task comments
router.delete("/:id", validateParams(idSchema), deleteTaskComment);

export default router;
