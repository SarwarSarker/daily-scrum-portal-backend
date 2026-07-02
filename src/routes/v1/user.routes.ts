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

// Admin, Manager & Team Lead can create users
router.post(
  "/",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, {
    message: "You are not permitted to add user",
  }),
  validate(createUserSchema),
  createUser
);

// Any authenticated user can view all users
router.get("/", getUsers);

// All authenticated users can view their own profile
router.get("/profile", getProfile);

// Any authenticated user can view any user
router.get("/:id", validateParams(idSchema), getUserById);

// Users can update their own profile, Admin can update any
router.patch("/:id", validateParams(idSchema), validate(updateUserSchema), updateUser);

// Admin, Manager & Team Lead can delete users
router.delete(
  "/:id",
  authorize(Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, {
    message: "You are not permitted to remove user",
  }),
  validateParams(idSchema),
  deleteUser
);

export default router;
