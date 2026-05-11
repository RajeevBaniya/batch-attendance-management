type Invite = {
  token: string;
  expiresAt: string;
};

type GenerateInvitePayload = {
  batchId: string;
};

type JoinBatchWithInvitePayload = {
  token: string;
};

type JoinBatchResult = {
  batchId: string;
  studentId: string;
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
  GenerateInvitePayload,
  Invite,
  JoinBatchResult,
  JoinBatchWithInvitePayload,
};
