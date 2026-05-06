import express from "express";
import cors from "cors";
import { Role } from "@prisma/client";
import authMiddleware from "./middleware/authMiddleware";
import restrictMonitoringWriteAccess from "./middleware/monitoringMiddleware";
import requireRole from "./middleware/roleMiddleware";
import attendanceRouter from "./modules/attendance/attendanceRoutes";
import batchRouter from "./modules/batches/batchRoutes";
import institutionRouter from "./modules/batches/institutionRoutes";
import programmeRouter from "./modules/batches/programmeRoutes";
import sessionRouter from "./modules/sessions/sessionRoutes";
import userRouter from "./modules/users/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).send("OK");
});

app.use("/api", authMiddleware);
app.use("/api", restrictMonitoringWriteAccess);

app.use("/api/users", userRouter);
app.use("/api/batches", batchRouter);
app.use("/api/institutions", institutionRouter);
app.use("/api/programme", programmeRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/attendance", attendanceRouter);

app.get("/api/test-role", requireRole([Role.TRAINER]), (_req, res) => {
  return res.status(200).json({
    success: true,
    data: "Role access granted",
  });
});

export default app;
