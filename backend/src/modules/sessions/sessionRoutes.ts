import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { createSessionHandler, getSessionAttendanceHandler, getTrainerSessionsHandler } from "./sessionController";

const sessionRouter = Router();

sessionRouter.post("/", requireRole([Role.TRAINER]), createSessionHandler);
sessionRouter.get("/trainer", requireRole([Role.TRAINER]), getTrainerSessionsHandler);
sessionRouter.get("/:id/attendance", requireRole([Role.TRAINER]), getSessionAttendanceHandler);

export default sessionRouter;
