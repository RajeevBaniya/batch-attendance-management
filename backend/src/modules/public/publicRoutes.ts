import { Router } from "express";

import { getPublicInstitutionsHandler } from "./publicController";

const publicRouter = Router();

publicRouter.get("/institutions", getPublicInstitutionsHandler);

export default publicRouter;
