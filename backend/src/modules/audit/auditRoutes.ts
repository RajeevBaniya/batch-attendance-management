import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";

import { getAuditLogsHandler } from "./auditController";

const auditRouter = Router();

auditRouter.get(
  "/logs",
  requireRole([Role.SUPER_ADMIN, Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER]),
  getAuditLogsHandler,
);

export default auditRouter;
