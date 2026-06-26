// routes/v1/project-update.routes.ts

import { Router } from "express";
import {
  createProjectUpdate,
  getProjectUpdates,
  getProjectUpdateById,
  updateProjectUpdate,
  deleteProjectUpdate,
} from "../../controllers/project-update.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";

const router = Router();

// All project update routes require authentication
router.use(authenticate);

// All authenticated users can create project updates
router.post("/", createProjectUpdate);

// All authenticated users can view project updates
router.get("/", getProjectUpdates);
router.get("/:id", getProjectUpdateById);

// Users can update their own project updates, admins can update any
router.patch("/:id", updateProjectUpdate);

// Users can delete their own project updates, admins can delete any
router.delete("/:id", deleteProjectUpdate);

export default router;
