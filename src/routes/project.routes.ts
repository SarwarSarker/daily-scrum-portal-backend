// routes/project.routes.ts

import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../utlis/helper";
import { Role } from "../utlis/role";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listProjects));
router.get("/:id", asyncHandler(getProject));

router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD),
  asyncHandler(createProject)
);
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD),
  asyncHandler(updateProject)
);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(deleteProject));

export default router;
