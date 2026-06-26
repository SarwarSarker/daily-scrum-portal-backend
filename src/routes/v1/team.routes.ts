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

// Admin & Manager can create teams
router.post("/", authorize(Role.ADMIN, Role.MANAGER), validate(createTeamSchema), createTeam);

// All authenticated users can view teams
router.get("/", getTeams);
router.get("/:id", validateParams(idSchema), getTeamById);

// Admin & Manager can update/delete teams
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), validate(updateTeamSchema), updateTeam);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), deleteTeam);

export default router;
