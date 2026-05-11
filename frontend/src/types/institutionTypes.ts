type Institution = {
  id: string;
  name: string;
  createdBySuperAdminId: string;
  createdAt: string;
};

type InstitutionAdmin = {
  id: string;
  clerkUserId: string | null;
  email: string | null;
  name: string;
  role: string;
  institutionId: string | null;
  createdAt: string;
};

type InstitutionOption = {
  id: string;
  name: string;
};

type InstitutionTrainer = {
  id: string;
  name: string;
  email: string | null;
};

type CreateInstitutionPayload = {
  name: string;
};

type CreateInstitutionAdminPayload = {
  name: string;
  email: string;
  password: string;
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
  CreateInstitutionAdminPayload,
  CreateInstitutionPayload,
  Institution,
  InstitutionAdmin,
  InstitutionOption,
  InstitutionTrainer,
};
