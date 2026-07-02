// routes/v1/team.routes.ts

import { Router } from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../../controllers/team.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";
import { validate, validateParams, idSchema } from "../../core/validation";
import { createTeamSchema, updateTeamSchema } from "../../core/validation/team.validator";

const router = Router();

// All team routes require authentication
router.use(authenticate);

// Admin, Manager & Team Lead can create teams
router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, {
    message: "You are not permitted to add team",
  }),
  validate(createTeamSchema),
  createTeam
);

// All authenticated users can view teams
router.get("/", getTeams);
router.get("/:id", validateParams(idSchema), getTeamById);

// Admin & Manager can update teams
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), validate(updateTeamSchema), updateTeam);

// Admin, Manager & Team Lead can remove teams
router.delete(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, {
    message: "You are not permitted to remove team",
  }),
  validateParams(idSchema),
  deleteTeam
);

export default router;
