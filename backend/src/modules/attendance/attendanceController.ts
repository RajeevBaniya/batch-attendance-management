import { type Request, type Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { buildPaginatedData, parsePaginationParams } from "../../utils/pagination";

import { getStudentAttendance, markAttendance } from "./attendanceService";
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
      TRAINER_INSTITUTION_REQUIRED: {
        status: 400,
        message: "Invalid request",
      },
      STUDENT_NOT_IN_BATCH: {
        status: 403,
        message: "Forbidden",
      },
      TRAINER_NOT_ASSIGNED_TO_SESSION_BATCH: {
        status: 403,
        message: "Forbidden",
      },
    });
  }
};

const getStudentAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = attendanceQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
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

    const pagination = parsePaginationParams(req.query);
    const attendance = await getStudentAttendance(req.user, pagination);
    return res.status(200).json({
      success: true,
      data: buildPaginatedData(attendance.items, attendance.totalItems, pagination.page, pagination.limit),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { getStudentAttendanceHandler, markAttendanceHandler };
