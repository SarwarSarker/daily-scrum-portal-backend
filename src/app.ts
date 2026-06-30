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

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browsers
};

app.use(cors(corsOptions)); // Also handles OPTIONS preflight automatically

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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