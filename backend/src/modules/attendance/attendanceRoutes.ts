import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { attendanceWriteRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import { getStudentAttendanceHandler, markAttendanceHandler } from "./attendanceController";

const attendanceRouter = Router();

attendanceRouter.post("/", attendanceWriteRateLimiter, requireRole([Role.TRAINER]), markAttendanceHandler);
attendanceRouter.get("/student", requireRole([Role.STUDENT]), getStudentAttendanceHandler);

export default attendanceRouter;
