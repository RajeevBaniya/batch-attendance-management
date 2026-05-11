import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AssignTrainerPayload,
  Batch,
  CreateBatchPayload,
} from "../types/batchTypes";
import type { PaginatedData, PaginationParams } from "../types/paginationTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const createBatch = async (payload: CreateBatchPayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<Batch>>("/api/batches", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getBatches = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedData<Batch>>>("/api/batches", {
      params: pagination,
    });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const assignTrainerToBatch = async (batchId: string, payload: AssignTrainerPayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<{ batchId: string; trainerId: string }>>(
      `/api/batches/${batchId}/trainers`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { assignTrainerToBatch, createBatch, getBatches };
