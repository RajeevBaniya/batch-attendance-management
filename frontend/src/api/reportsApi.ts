import axios from "axios";

import { apiClient } from "./client";
import type { BaseReportFilter } from "../types/reportTypes";

type ExportedFile = {
  filename: string;
  blob: Blob;
};

const resolveFilename = (headerValue: string | undefined, fallbackFilename: string) => {
  if (!headerValue) {
    return fallbackFilename;
  }

  const filenameMatch = headerValue.match(/filename="([^"]+)"/i);
  return filenameMatch?.[1] ?? fallbackFilename;
};

const requestReport = async (path: string, params: BaseReportFilter, fallbackFilename: string) => {
  try {
    const response = await apiClient.get(path, {
      params,
      responseType: "blob",
    });
    return {
      filename: resolveFilename(response.headers["content-disposition"], fallbackFilename),
      blob: response.data as Blob,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      throw new Error("Report export failed", { cause: error });
    }
    throw new Error("Report export failed", { cause: error });
  }
};

const exportTrainerAttendanceReport = async (params: BaseReportFilter): Promise<ExportedFile> => {
  return requestReport("/api/reports/trainer-attendance", params, "trainer-attendance-report.csv");
};

const exportInstitutionAttendanceSummaryReport = async (params: BaseReportFilter): Promise<ExportedFile> => {
  return requestReport(
    "/api/reports/institution-attendance-summary",
    params,
    "institution-attendance-summary.csv",
  );
};

const exportStudentAttendanceReport = async (params: BaseReportFilter): Promise<ExportedFile> => {
  return requestReport("/api/reports/student-attendance", params, "student-attendance-history.csv");
};

const exportProgrammeSummaryReport = async (): Promise<ExportedFile> => {
  return requestReport("/api/reports/programme-summary", {}, "programme-operational-summary.csv");
};

const triggerCsvDownload = (file: ExportedFile) => {
  const objectUrl = window.URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export {
  exportInstitutionAttendanceSummaryReport,
  exportProgrammeSummaryReport,
  exportStudentAttendanceReport,
  exportTrainerAttendanceReport,
  triggerCsvDownload,
};
