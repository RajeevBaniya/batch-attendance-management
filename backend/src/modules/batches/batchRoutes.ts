import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { inviteGenerationRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import {
  assignStudentHandler,
  assignTrainerHandler,
  createBatchHandler,
  getBatchesHandler,
  getTrainerBatchesHandler,
  generateInviteHandler,
  getBatchSummaryHandler,
  joinBatchHandler,
} from "./batchController";

const batchRouter = Router();

batchRouter.post("/", requireRole([Role.TRAINER, Role.INSTITUTION]), createBatchHandler);
batchRouter.get("/", requireRole([Role.INSTITUTION]), getBatchesHandler);
batchRouter.get("/trainer", requireRole([Role.TRAINER]), getTrainerBatchesHandler);
batchRouter.post("/:id/trainers", requireRole([Role.INSTITUTION]), assignTrainerHandler);
batchRouter.post("/:id/students", requireRole([Role.INSTITUTION, Role.TRAINER]), assignStudentHandler);
batchRouter.post(
  "/:id/invite",
  inviteGenerationRateLimiter,
  requireRole([Role.TRAINER, Role.INSTITUTION]),
  generateInviteHandler,
);
batchRouter.post("/join", requireRole([Role.STUDENT]), joinBatchHandler);
batchRouter.get("/:id/summary", requireRole([Role.INSTITUTION, Role.PROGRAMME_MANAGER]), getBatchSummaryHandler);

export default batchRouter;
