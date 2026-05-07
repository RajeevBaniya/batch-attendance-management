import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { getAnalyticsInstitutionsHandler } from "./analyticsController";

const analyticsRouter = Router();

analyticsRouter.get(
  "/institutions",
  requireRole([Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER]),
  getAnalyticsInstitutionsHandler,
);

export default analyticsRouter;
