import { z } from "zod";

const createBatchSchema = z.object({
  name: z.string().trim().min(1),
});

const assignTrainerSchema = z.object({
  trainerId: z.string().uuid(),
});

const assignStudentSchema = z.object({
  studentId: z.string().uuid(),
});

const joinBatchSchema = z.object({
  token: z.string().trim().min(1),
});

const batchIdParamSchema = z.object({
  id: z.string().uuid(),
});

const institutionIdParamSchema = z.object({
  id: z.string().uuid(),
});

const batchQuerySchema = z.object({}).passthrough();

type CreateBatchInput = {
  name: string;
};

type AssignTrainerInput = {
  trainerId: string;
};

type AssignStudentInput = {
  studentId: string;
};

type JoinBatchInput = {
  token: string;
};

export {
  createBatchSchema,
  assignTrainerSchema,
  assignStudentSchema,
  joinBatchSchema,
  batchIdParamSchema,
  institutionIdParamSchema,
  batchQuerySchema,
};
export type { CreateBatchInput, AssignTrainerInput, AssignStudentInput, JoinBatchInput };
