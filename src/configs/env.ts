import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access-secret",

  accessExpires: process.env.ACCESS_TOKEN_EXPIRES || "1d",
};