import { Request, Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { createSession, getSessionAttendance } from "./sessionService";
import { createSessionSchema, sessionIdParamSchema, sessionQuerySchema } from "./sessionTypes";

const createSessionHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = sessionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = createSessionSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const session = await createSession(parsedBody.data, req.user);

    return res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_INSTITUTION_REQUIRED: {
        status: 400,
        message: "Invalid request",
      },
    });
  }
};

const getSessionAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = sessionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = sessionIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const attendanceView = await getSessionAttendance(parsedParams.data.id, req.user);

    return res.status(200).json({
      success: true,
      data: attendanceView,
    });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_INSTITUTION_REQUIRED: {
        status: 400,
        message: "Invalid request",
      },
    });
  }
};

export { createSessionHandler, getSessionAttendanceHandler };
