import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import { trainerRequestCreationRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import {
  approveTrainerRequestHandler,
  createTrainerRequestHandler,
  getTrainerRequestsHandler,
} from "./institutionController";

const trainerRequestRouter = Router();

trainerRequestRouter.post("/", trainerRequestCreationRateLimiter, createTrainerRequestHandler);
trainerRequestRouter.get("/", requireRole([Role.INSTITUTION]), getTrainerRequestsHandler);
trainerRequestRouter.post("/:id/approve", requireRole([Role.INSTITUTION]), approveTrainerRequestHandler);

export default trainerRequestRouter;
