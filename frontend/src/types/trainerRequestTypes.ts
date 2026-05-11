type TrainerRequestStatus = "PENDING" | "APPROVED";

type TrainerRequest = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  status: TrainerRequestStatus;
  createdAt: string;
};

type CreateTrainerRequestPayload = {
  institutionId: string;
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
  CreateTrainerRequestPayload,
  TrainerRequest,
  TrainerRequestStatus,
};
