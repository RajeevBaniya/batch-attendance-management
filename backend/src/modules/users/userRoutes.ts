import { Router } from "express";

import { createUserHandler, getUserHandler } from "./userController";

const userRouter = Router();

userRouter.post("/", createUserHandler);
userRouter.get("/:id", getUserHandler);

export default userRouter;
