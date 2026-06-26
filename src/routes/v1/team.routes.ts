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

const router = Router();

// All team routes require authentication
router.use(authenticate);

// Admin & Manager can create teams
router.post("/", authorize(Role.ADMIN, Role.MANAGER), createTeam);

// All authenticated users can view teams
router.get("/", getTeams);
router.get("/:id", getTeamById);

// Admin & Manager can update/delete teams
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), updateTeam);
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), deleteTeam);

export default router;
