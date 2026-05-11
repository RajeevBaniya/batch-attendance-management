import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  Invite,
  JoinBatchResult,
  JoinBatchWithInvitePayload,
} from "../types/inviteTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const generateInvite = async (batchId: string) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<Invite>>(`/api/batches/${batchId}/invite`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const joinBatchWithInvite = async (payload: JoinBatchWithInvitePayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<JoinBatchResult>>("/api/batches/join", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { generateInvite, joinBatchWithInvite };
