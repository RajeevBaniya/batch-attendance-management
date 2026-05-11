import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateTrainerRequestPayload,
  TrainerRequest,
} from "../types/trainerRequestTypes";
import type { PaginatedData, PaginationParams } from "../types/paginationTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const createTrainerRequest = async (payload: CreateTrainerRequestPayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<TrainerRequest>>("/api/trainer-requests", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getTrainerRequests = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedData<TrainerRequest>>>("/api/trainer-requests", {
      params: pagination,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const approveTrainerRequest = async (trainerRequestId: string) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<TrainerRequest>>(
      `/api/trainer-requests/${trainerRequestId}/approve`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { approveTrainerRequest, createTrainerRequest, getTrainerRequests };
