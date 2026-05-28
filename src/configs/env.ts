import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,

  accessExpires: process.env.ACCESS_TOKEN_EXPIRES!,
  refreshExpires: process.env.REFRESH_TOKEN_EXPIRES!,
};