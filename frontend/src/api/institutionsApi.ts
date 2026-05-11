import axios from "axios";

import { apiClient } from "./client";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateInstitutionAdminPayload,
  CreateInstitutionPayload,
  Institution,
  InstitutionAdmin,
  InstitutionOption,
  InstitutionTrainer,
} from "../types/institutionTypes";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? "Request failed";
  }

  return "Request failed";
};

const createInstitution = async (payload: CreateInstitutionPayload) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<Institution>>("/api/institutions", payload);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const createInstitutionAdmin = async (
  institutionId: string,
  payload: CreateInstitutionAdminPayload,
) => {
  try {
    const response = await apiClient.post<ApiSuccessResponse<InstitutionAdmin>>(
      `/api/institutions/${institutionId}/admin`,
      payload,
    );
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getInstitutions = async () => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<InstitutionOption[]>>("/api/institutions");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getPublicInstitutions = async () => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<InstitutionOption[]>>("/api/public/institutions");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

const getInstitutionTrainers = async () => {
  try {
    const response = await apiClient.get<ApiSuccessResponse<InstitutionTrainer[]>>("/api/institutions/trainers");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
};

export {
  createInstitution,
  createInstitutionAdmin,
  getInstitutions,
  getInstitutionTrainers,
  getPublicInstitutions,
};
