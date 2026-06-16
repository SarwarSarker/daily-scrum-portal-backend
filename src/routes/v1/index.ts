// routes/v1/index.ts

import { Router } from "express";
import authRoutes from "../auth.routes";
import departmentRoutes from "../department.routes";
import teamRoutes from "../team.routes";
import projectRoutes from "../project.routes";
import taskRoutes from "../task.routes";
import projectUpdateRoutes from "../project-update.routes";
import taskCommentRoutes from "../task-comment.routes";
import attachmentRoutes from "../attachment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/teams", teamRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/project-updates", projectUpdateRoutes);
router.use("/task-comments", taskCommentRoutes);
router.use("/attachments", attachmentRoutes);

export default router;
