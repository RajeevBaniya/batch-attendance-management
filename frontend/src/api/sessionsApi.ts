import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateSessionPayload,
  Session,
  TrainerBatch,
  TrainerSessionRecord,
} from "../types/sessionTypes";
import type { PaginatedData, PaginationParams } from "../types/paginationTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const createSession = async (payload: CreateSessionPayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<Session>>("/api/sessions", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getTrainerBatches = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedData<TrainerBatch>>>("/api/batches/trainer", {
      params: pagination,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getTrainerSessions = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedData<TrainerSessionRecord>>>(
      "/api/sessions/trainer",
      {
        params: pagination,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { createSession, getTrainerBatches, getTrainerSessions };
