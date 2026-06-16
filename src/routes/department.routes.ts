// routes/department.routes.ts

import { Router } from "express";
import {
  createDepartment,
  listDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../utlis/helper";
import { Role } from "../utlis/role";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listDepartments));
router.get("/:id", asyncHandler(getDepartment));

router.post("/", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(createDepartment));
router.put("/:id", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(updateDepartment));
router.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(deleteDepartment));

export default router;
