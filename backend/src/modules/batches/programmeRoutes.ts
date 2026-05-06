import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { getProgrammeSummaryHandler } from "./batchController";

const programmeRouter = Router();

programmeRouter.get(
  "/summary",
  requireRole([Role.PROGRAMME_MANAGER]),
  getProgrammeSummaryHandler,
);

export default programmeRouter;
