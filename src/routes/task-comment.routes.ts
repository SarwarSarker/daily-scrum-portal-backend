// routes/task-comment.routes.ts

import { Router } from "express";
import {
  createTaskComment,
  listTaskComments,
  updateTaskComment,
  deleteTaskComment,
} from "../controllers/task-comment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utlis/helper";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listTaskComments));
router.post("/", asyncHandler(createTaskComment));
router.put("/:id", asyncHandler(updateTaskComment));
router.delete("/:id", asyncHandler(deleteTaskComment));

export default router;
