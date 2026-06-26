// routes/task.routes.ts

import { Router } from "express";
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../../controllers/task.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utlis/helper";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listTasks));
router.get("/:id", asyncHandler(getTask));
router.post("/", asyncHandler(createTask));
router.put("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));

export default router;
