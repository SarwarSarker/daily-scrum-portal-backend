import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import v1Routes from "./routes/v1";
import { errorHandler } from "./middlewares/error.middleware";
import { env } from "./configs/env";

// Prisma returns BigInt for id columns, which JSON.stringify cannot serialize.
// Render BigInt values as strings in all JSON responses.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(helmet());

// Serve uploaded files (attachments stored on local disk).
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.use("/api/v1", v1Routes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;