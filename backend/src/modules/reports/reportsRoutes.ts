import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { reportExportRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import {
  exportInstitutionAttendanceSummaryHandler,
  exportProgrammeSummaryHandler,
  exportStudentAttendanceHandler,
  exportTrainerAttendanceHandler,
} from "./reportsController";

const reportsRouter = Router();

reportsRouter.get(
  "/trainer-attendance",
  reportExportRateLimiter,
  requireRole([Role.TRAINER]),
  exportTrainerAttendanceHandler,
);
reportsRouter.get(
  "/institution-attendance-summary",
  reportExportRateLimiter,
  requireRole([Role.INSTITUTION, Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER, Role.SUPER_ADMIN]),
  exportInstitutionAttendanceSummaryHandler,
);
reportsRouter.get(
  "/student-attendance",
  reportExportRateLimiter,
  requireRole([Role.STUDENT]),
  exportStudentAttendanceHandler,
);
reportsRouter.get(
  "/programme-summary",
  reportExportRateLimiter,
  requireRole([Role.PROGRAMME_MANAGER, Role.MONITORING_OFFICER, Role.SUPER_ADMIN]),
  exportProgrammeSummaryHandler,
);

export default reportsRouter;
