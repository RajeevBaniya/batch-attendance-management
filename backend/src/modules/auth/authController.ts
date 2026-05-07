import { Request, Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { syncAuthenticatedUser } from "./authService";
import { authQuerySchema } from "./authTypes";

const syncAuthenticatedUserHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = authQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.authIdentity) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const syncedUser = await syncAuthenticatedUser(req.authIdentity);
    return res.status(200).json({
      success: true,
      data: syncedUser,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { syncAuthenticatedUserHandler };
