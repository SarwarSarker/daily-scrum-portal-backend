// routes/v1/dashboard.routes.ts

import { Router } from "express";
import { getDashboard } from "../../controllers/dashboard.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Dashboard routes require authentication
router.use(authenticate);

// Any authenticated user can view dashboard analytics
router.get("/", getDashboard);

export default router;
