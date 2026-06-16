// routes/project-update.routes.ts

import { Router } from "express";
import {
  createProjectUpdate,
  listProjectUpdates,
  getProjectUpdate,
  updateProjectUpdate,
  deleteProjectUpdate,
} from "../controllers/project-update.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../utlis/helper";
import { Role } from "../utlis/role";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listProjectUpdates));
router.get("/:id", asyncHandler(getProjectUpdate));
router.post("/", asyncHandler(createProjectUpdate));
router.put("/:id", asyncHandler(updateProjectUpdate));
router.delete(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD),
  asyncHandler(deleteProjectUpdate)
);

export default router;
