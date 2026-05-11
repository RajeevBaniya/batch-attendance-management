import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  MarkAttendancePayload,
  SessionAttendance,
  StudentAttendanceRecord,
} from "../types/attendanceTypes";
import type { PaginatedData, PaginationParams } from "../types/paginationTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const markAttendance = async (payload: MarkAttendancePayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<{ id: string }>>("/api/attendance", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getSessionAttendance = async (sessionId: string) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<SessionAttendance>>(`/api/sessions/${sessionId}/attendance`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getStudentAttendance = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedData<StudentAttendanceRecord>>>(
      "/api/attendance/student",
      {
        params: pagination,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { getSessionAttendance, getStudentAttendance, markAttendance };
