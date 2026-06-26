// routes/v1/department.routes.ts

import { Router } from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../../controllers/department.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";

const router = Router();

// All department routes require authentication
router.use(authenticate);

// Only admins can create/delete departments
router.post("/", authorize(Role.ADMIN), createDepartment);

// All authenticated users can view departments
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Admin & Manager can update departments
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), updateDepartment);
router.delete("/:id", authorize(Role.ADMIN), deleteDepartment);

export default router;
