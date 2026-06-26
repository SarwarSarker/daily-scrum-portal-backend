// routes/v1/user.routes.ts

import { Router } from "express";
import {
  getUsers,
  getUserById,
  getProfile,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";
import { validate, validateParams, idSchema } from "../../core/validation";
import { createUserSchema, updateUserSchema, userQuerySchema } from "../../core/validation/user.validator";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin & Manager can create and view all users
router.post("/", authorize(Role.ADMIN, Role.MANAGER), validate(createUserSchema), createUser);
router.get("/", authorize(Role.ADMIN, Role.MANAGER), getUsers);

// All authenticated users can view their own profile
router.get("/profile", getProfile);

// Admin & Manager can view any user
router.get("/:id", authorize(Role.ADMIN, Role.MANAGER), validateParams(idSchema), getUserById);

// Users can update their own profile, Admin can update any
router.patch("/:id", validateParams(idSchema), validate(updateUserSchema), updateUser);

// Only Admin can delete users
router.delete("/:id", authorize(Role.ADMIN), validateParams(idSchema), deleteUser);

export default router;
