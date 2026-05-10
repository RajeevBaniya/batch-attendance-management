import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { getInstitutionSummaryHandler } from "../batches/batchController";

import {
  createInstitutionAdminHandler,
  createInstitutionHandler,
  getInstitutionTrainersHandler,
  listInstitutionsHandler,
} from "./institutionController";

const institutionRouter = Router();

institutionRouter.post("/", requireRole([Role.SUPER_ADMIN]), createInstitutionHandler);
institutionRouter.get("/", requireRole([Role.SUPER_ADMIN]), listInstitutionsHandler);
institutionRouter.post("/:id/admin", requireRole([Role.SUPER_ADMIN]), createInstitutionAdminHandler);
institutionRouter.get("/trainers", requireRole([Role.INSTITUTION]), getInstitutionTrainersHandler);
institutionRouter.get(
  "/:id/summary",
  requireRole([Role.INSTITUTION, Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER]),
  getInstitutionSummaryHandler,
);

export default institutionRouter;
