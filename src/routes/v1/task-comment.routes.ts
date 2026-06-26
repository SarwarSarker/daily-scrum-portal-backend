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

const router = Router();

// All task comment routes require authentication
router.use(authenticate);

// All authenticated users can create task comments
router.post("/", createTaskComment);

// All authenticated users can view task comments
router.get("/", getTaskComments);
router.get("/:id", getTaskCommentById);

// Users can update their own task comments
router.patch("/:id", updateTaskComment);

// Users can delete their own task comments
router.delete("/:id", deleteTaskComment);

export default router;
