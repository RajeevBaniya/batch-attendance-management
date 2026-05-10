import { Role } from "@prisma/client";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import authMiddleware from "./middleware/authMiddleware";
import restrictMonitoringWriteAccess from "./middleware/monitoringMiddleware";
import requireRole from "./middleware/roleMiddleware";
import { corsOptions } from "./middleware/security/corsConfig";
import { requestLoggingMiddleware } from "./middleware/security/requestLoggingMiddleware";
import { requestSanitizationMiddleware } from "./middleware/security/requestSanitizationMiddleware";
import analyticsRouter from "./modules/analytics/analyticsRoutes";
import attendanceRouter from "./modules/attendance/attendanceRoutes";
import auditRouter from "./modules/audit/auditRoutes";
import authRouter from "./modules/auth/authRoutes";
import batchRouter from "./modules/batches/batchRoutes";
import programmeRouter from "./modules/batches/programmeRoutes";
import institutionRouter from "./modules/institutions/institutionRoutes";
import superAdminRouter from "./modules/institutions/superAdminRoutes";
import trainerRequestRouter from "./modules/institutions/trainerRequestRoutes";
import publicRouter from "./modules/public/publicRoutes";
import realtimeRouter from "./modules/realtime/realtimeRoutes";
import reportsRouter from "./modules/reports/reportsRoutes";
import sessionRouter from "./modules/sessions/sessionRoutes";
import userRouter from "./modules/users/userRoutes";

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "connect-src": ["'self'", "https://*.clerk.accounts.dev", "https://*.clerk.com"],
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(requestLoggingMiddleware);
app.use(requestSanitizationMiddleware);

app.get("/health", (_req, res) => {
  return res.status(200).send("OK");
});

app.use("/api/public", publicRouter);

app.use("/api", authMiddleware);
app.use("/api", restrictMonitoringWriteAccess);

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/batches", batchRouter);
app.use("/api/institutions", institutionRouter);
app.use("/api", superAdminRouter);
app.use("/api/trainer-requests", trainerRequestRouter);
app.use("/api/programme", programmeRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/realtime", realtimeRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/audit", auditRouter);
app.use("/api/reports", reportsRouter);

app.get("/api/test-role", requireRole([Role.TRAINER]), (_req, res) => {
  return res.status(200).json({
    success: true,
    data: "Role access granted",
  });
});

export default app;
