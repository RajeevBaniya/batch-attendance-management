import { Router } from "express";

import { authSyncRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import { syncAuthenticatedUserHandler } from "./authController";

const authRouter = Router();

authRouter.post("/sync", authSyncRateLimiter, syncAuthenticatedUserHandler);

export default authRouter;
