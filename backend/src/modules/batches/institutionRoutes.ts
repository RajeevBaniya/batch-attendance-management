import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { getInstitutionSummaryHandler } from "./batchController";

const institutionRouter = Router();

institutionRouter.get(
  "/:id/summary",
  requireRole([Role.INSTITUTION, Role.PROGRAMME_MANAGER]),
  getInstitutionSummaryHandler,
);

export default institutionRouter;
