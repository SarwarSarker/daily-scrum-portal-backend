// middleware/upload.middleware.ts

import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../configs/env";

const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // Unique, collision-safe name while keeping the original extension.
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
    const unique = `${process.hrtime.bigint().toString(36)}-${Math.round(
      process.uptime() * 1000
    )}`;
    cb(null, `${base || "file"}-${unique}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes },
});
