import { type Request, type Response } from "express";

import { errorResponse } from "../../utils/errorResponse";

import { createUser, getUserById } from "./userService";
import { createUserSchema, userIdParamSchema, userQuerySchema } from "./userTypes";

const createUserHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = userQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = createUserSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const createdUser = await createUser(parsedBody.data);

    return res.status(201).json({
      success: true,
      data: createdUser,
    });
  } catch (error) {
    return errorResponse(res, error, {
      CLERK_USER_ID_EXISTS: {
        status: 409,
        message: "Conflict",
      },
    });
  }
};

const getUserHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = userQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = userIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const user = await getUserById(parsedParams.data.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { createUserHandler, getUserHandler };
