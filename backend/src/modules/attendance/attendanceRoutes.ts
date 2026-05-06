import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { markAttendanceHandler } from "./attendanceController";

const attendanceRouter = Router();

attendanceRouter.post("/mark", requireRole([Role.STUDENT]), markAttendanceHandler);

export default attendanceRouter;
