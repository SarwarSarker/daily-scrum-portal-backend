// routes/v1/user.routes.ts

import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../controllers/user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { Role } from "../../utlis/role";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Admin & Manager can view all users
router.get("/", authorize(Role.ADMIN, Role.MANAGER), getUsers);

// All authenticated users can view their own profile
router.get("/profile", getUserById);

// Admin & Manager can view any user
router.get("/:id", authorize(Role.ADMIN, Role.MANAGER), getUserById);

// Users can update their own profile, Admin can update any
router.patch("/:id", updateUser);

// Only Admin can delete users
router.delete("/:id", authorize(Role.ADMIN), deleteUser);

export default router;
