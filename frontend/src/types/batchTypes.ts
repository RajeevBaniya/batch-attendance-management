type Batch = {
  id: string;
  name: string;
  createdAt: string;
  trainerCount: number;
  studentCount: number;
};

type CreateBatchPayload = {
  name: string;
};

type AssignTrainerPayload = {
  trainerId: string;
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
  AssignTrainerPayload,
  Batch,
  CreateBatchPayload,
};
