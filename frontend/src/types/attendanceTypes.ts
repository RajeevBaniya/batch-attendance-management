type AttendanceStatus = "PRESENT" | "ABSENT";

type SessionAttendanceStudent = {
  studentId: string;
  studentName: string;
  status: AttendanceStatus | null;
};

type SessionAttendance = {
  sessionId: string;
  batchId: string;
  students: SessionAttendanceStudent[];
};

type MarkAttendancePayload = {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
};

type StudentAttendanceRecord = {
  sessionId: string;
  title: string;
  batchName: string;
  date: string;
  status: AttendanceStatus | null;
};

type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
};

type ApiErrorResponse = {
  success: false;
  message: string;
};

export type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AttendanceStatus,
  MarkAttendancePayload,
  SessionAttendance,
  SessionAttendanceStudent,
  StudentAttendanceRecord,
};
