import { Request, Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { markAttendance } from "./attendanceService";
import { attendanceQuerySchema, markAttendanceSchema } from "./attendanceTypes";

const markAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = attendanceQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = markAttendanceSchema.safeParse(req.body);

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

    const attendance = await markAttendance(parsedBody.data, req.user);

    return res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    return errorResponse(res, error, {
      SESSION_NOT_ACTIVE: {
        status: 400,
        message: "Invalid request",
      },
      ATTENDANCE_ALREADY_MARKED: {
        status: 409,
        message: "Conflict",
      },
    });
  }
};

export { markAttendanceHandler };
