import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access-secret",

  accessExpires: process.env.ACCESS_TOKEN_EXPIRES || "1d",

  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024, // 10 MB
};