import { Router } from "express";

import { realtimeStreamRateLimiter } from "../../middleware/security/rateLimitMiddleware";

import { streamRealtimeHandler } from "./realtimeController";

const realtimeRouter = Router();

realtimeRouter.get("/stream", realtimeStreamRateLimiter, streamRealtimeHandler);

export default realtimeRouter;
