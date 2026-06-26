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
import { validate, validateParams, idSchema } from "../../core/validation";
import { createDepartmentSchema, updateDepartmentSchema } from "../../core/validation/department.validator";

const router = Router();

// All department routes require authentication
router.use(authenticate);

// Only admins can create/delete departments
router.post("/", authorize(Role.ADMIN), validate(createDepartmentSchema), createDepartment);

// All authenticated users can view departments
router.get("/", getDepartments);
router.get("/:id", validateParams(idSchema), getDepartmentById);

// Admin & Manager can update departments
router.patch("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), validate(updateDepartmentSchema), updateDepartment);
router.delete("/:id", authorize(Role.ADMIN), validateParams(idSchema), deleteDepartment);

export default router;
