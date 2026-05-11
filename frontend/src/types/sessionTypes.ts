type TrainerBatch = {
  id: string;
  name: string;
};

type CreateSessionPayload = {
  batchId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Session = {
  id: string;
  batchId: string;
  trainerId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type TrainerSessionRecord = {
  id: string;
  title: string;
  batchName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
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
  CreateSessionPayload,
  Session,
  TrainerBatch,
  TrainerSessionRecord,
};
