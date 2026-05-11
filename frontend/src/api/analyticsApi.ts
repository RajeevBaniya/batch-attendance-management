import axios from "axios";

import { apiClient } from "./client";
import type {
  AnalyticsApiErrorResponse,
  AnalyticsApiSuccessResponse,
  AnalyticsInstitutionOption,
  InstitutionSummary,
  ProgrammeSummary,
} from "../types/analyticsTypes";
import type { PaginatedData, PaginationParams } from "../types/paginationTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<AnalyticsApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const getProgrammeSummary = async () => {
  try {
    const response = await apiClient.get<AnalyticsApiSuccessResponse<ProgrammeSummary>>("/api/programme/summary");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getInstitutionSummary = async (institutionId: string) => {
  try {
    const response = await apiClient.get<AnalyticsApiSuccessResponse<InstitutionSummary>>(
      `/api/institutions/${institutionId}/summary`,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getAnalyticsInstitutions = async (pagination: PaginationParams) => {
  try {
    const response = await apiClient.get<AnalyticsApiSuccessResponse<PaginatedData<AnalyticsInstitutionOption>>>(
      "/api/analytics/institutions",
      {
        params: pagination,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export { getAnalyticsInstitutions, getInstitutionSummary, getProgrammeSummary };
