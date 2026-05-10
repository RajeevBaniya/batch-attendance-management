import { type Request, type Response } from "express";

import { errorResponse } from "../../utils/errorResponse";

import {
  exportInstitutionAttendanceSummaryCsv,
  exportProgrammeSummaryCsv,
  exportStudentAttendanceCsv,
  exportTrainerAttendanceCsv,
} from "./reportsService";
import { exportFilterSchema } from "./reportTypes";

const buildCsvFilename = (prefix: string) => {
  const datePart = new Date().toISOString().split("T")[0];
  return `${prefix}-${datePart}.csv`;
};

const sendCsvFile = (res: Response, filename: string, csvContent: string) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
};

const buildActor = (req: Request) => {
  if (!req.user) {
    throw new Error("UNAUTHORIZED_USER");
  }

  return {
    id: req.user.id,
    role: req.user.role,
    institutionId: req.user.institutionId,
  };
};

const exportTrainerAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const parsedFilters = exportFilterSchema.safeParse(req.query);
    if (!parsedFilters.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const csvContent = await exportTrainerAttendanceCsv(buildActor(req), parsedFilters.data);
    return sendCsvFile(res, buildCsvFilename("trainer-attendance-report"), csvContent);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const exportInstitutionAttendanceSummaryHandler = async (req: Request, res: Response) => {
  try {
    const parsedFilters = exportFilterSchema.safeParse(req.query);
    if (!parsedFilters.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const csvContent = await exportInstitutionAttendanceSummaryCsv(buildActor(req), parsedFilters.data);
    return sendCsvFile(res, buildCsvFilename("institution-attendance-summary"), csvContent);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const exportStudentAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const parsedFilters = exportFilterSchema.safeParse(req.query);
    if (!parsedFilters.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const csvContent = await exportStudentAttendanceCsv(buildActor(req), parsedFilters.data);
    return sendCsvFile(res, buildCsvFilename("student-attendance-history"), csvContent);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const exportProgrammeSummaryHandler = async (req: Request, res: Response) => {
  try {
    const csvContent = await exportProgrammeSummaryCsv(buildActor(req));
    return sendCsvFile(res, buildCsvFilename("programme-operational-summary"), csvContent);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export {
  exportInstitutionAttendanceSummaryHandler,
  exportProgrammeSummaryHandler,
  exportStudentAttendanceHandler,
  exportTrainerAttendanceHandler,
};
