// routes/auth.routes.ts

import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { Role } from "../utlis/role";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Example protected route — only admins can access.
router.get("/admin", authenticate, authorize(Role.ADMIN), (req, res) => {
  res.json({ message: "Hello admin", user: req.user });
});

export default router;
