import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { getStudentAttendanceHandler, markAttendanceHandler } from "./attendanceController";

const attendanceRouter = Router();

attendanceRouter.post("/", requireRole([Role.TRAINER]), markAttendanceHandler);
attendanceRouter.get("/student", requireRole([Role.STUDENT]), getStudentAttendanceHandler);

export default attendanceRouter;
