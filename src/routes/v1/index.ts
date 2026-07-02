// routes/v1/index.ts

import { Router } from "express";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import taskRoutes from "./task.routes";
import teamRoutes from "./team.routes";
import departmentRoutes from "./department.routes";
import projectUpdateRoutes from "./project-update.routes";
import userRoutes from "./user.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/teams", teamRoutes);
router.use("/departments", departmentRoutes);
router.use("/project-updates", projectUpdateRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
