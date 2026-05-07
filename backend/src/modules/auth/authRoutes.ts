import { Router } from "express";

import { syncAuthenticatedUserHandler } from "./authController";

const authRouter = Router();

authRouter.post("/sync", syncAuthenticatedUserHandler);

export default authRouter;
