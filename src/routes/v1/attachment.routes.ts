// routes/attachment.routes.ts

import { Router } from "express";
import {
  createAttachment,
  listAttachments,
  getAttachment,
  deleteAttachment,
} from "../../controllers/attachment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { asyncHandler } from "../../utlis/helper";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listAttachments));
router.get("/:id", asyncHandler(getAttachment));
router.post("/", upload.single("file"), asyncHandler(createAttachment));
router.delete("/:id", asyncHandler(deleteAttachment));

export default router;
