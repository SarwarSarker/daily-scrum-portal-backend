// routes/team.routes.ts

import { Router } from "express";
import {
  createTeam,
  listTeams,
  getTeam,
  updateTeam,
  deleteTeam,
} from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../utlis/helper";
import { Role } from "../utlis/role";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listTeams));
router.get("/:id", asyncHandler(getTeam));

router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD),
  asyncHandler(createTeam)
);
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD),
  asyncHandler(updateTeam)
);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(deleteTeam));

export default router;
