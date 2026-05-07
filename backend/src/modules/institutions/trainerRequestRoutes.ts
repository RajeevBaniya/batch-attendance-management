import { Role } from "@prisma/client";
import { Router } from "express";

import requireRole from "../../middleware/roleMiddleware";
import {
  approveTrainerRequestHandler,
  createTrainerRequestHandler,
  getTrainerRequestsHandler,
} from "./institutionController";

const trainerRequestRouter = Router();

trainerRequestRouter.post("/", createTrainerRequestHandler);
trainerRequestRouter.get("/", requireRole([Role.INSTITUTION]), getTrainerRequestsHandler);
trainerRequestRouter.post("/:id/approve", requireRole([Role.INSTITUTION]), approveTrainerRequestHandler);

export default trainerRequestRouter;
