type AttendanceMetrics = {
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
};

type InstitutionSummary = AttendanceMetrics & {
  institutionId: string;
  totalBatches: number;
  totalStudents: number;
  totalSessions: number;
};

type ProgrammeSummary = AttendanceMetrics & {
  totalInstitutions: number;
  totalBatches: number;
  totalStudents: number;
  totalSessions: number;
};

type AnalyticsInstitutionOption = {
  id: string;
  name: string;
};

type AnalyticsApiSuccessResponse<TData> = {
  success: true;
  data: TData;
};

type AnalyticsApiErrorResponse = {
  success: false;
  message: string;
};

export type {
  AnalyticsApiErrorResponse,
  AnalyticsApiSuccessResponse,
  AnalyticsInstitutionOption,
  AttendanceMetrics,
  InstitutionSummary,
  ProgrammeSummary,
};
