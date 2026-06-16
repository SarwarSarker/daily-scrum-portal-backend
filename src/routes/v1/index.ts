// routes/v1/index.ts

import { Router } from "express";
import authRoutes from "../auth.routes";
import departmentRoutes from "../department.routes";
import teamRoutes from "../team.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/teams", teamRoutes);

export default router;
