import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { createMonitoringOfficerHandler, createProgrammeManagerHandler } from "./institutionController";

const superAdminRouter = Router();

superAdminRouter.post("/programme-managers", requireRole([Role.SUPER_ADMIN]), createProgrammeManagerHandler);
superAdminRouter.post("/monitoring-officers", requireRole([Role.SUPER_ADMIN]), createMonitoringOfficerHandler);

export default superAdminRouter;
