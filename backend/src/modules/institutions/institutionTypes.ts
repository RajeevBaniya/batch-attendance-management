import { z } from "zod";

const institutionQuerySchema = z.object({}).passthrough();

const institutionIdParamSchema = z.object({
  id: z.string().uuid(),
});

const trainerRequestIdParamSchema = z.object({
  id: z.string().uuid(),
});

const trainerRequestQuerySchema = z.object({}).passthrough();

const createInstitutionSchema = z.object({
  name: z.string().trim().min(1),
});

const createInstitutionAdminSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const createRoleUserSchema = z.object({
  name: z.string().trim().min(1),
  clerkUserId: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const createTrainerRequestSchema = z.object({
  institutionId: z.string().uuid(),
});

type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
type CreateInstitutionAdminInput = z.infer<typeof createInstitutionAdminSchema>;
type CreateRoleUserInput = z.infer<typeof createRoleUserSchema>;
type CreateTrainerRequestInput = z.infer<typeof createTrainerRequestSchema>;

export {
  institutionQuerySchema,
  institutionIdParamSchema,
  trainerRequestIdParamSchema,
  trainerRequestQuerySchema,
  createInstitutionSchema,
  createInstitutionAdminSchema,
  createRoleUserSchema,
  createTrainerRequestSchema,
};
export type {
  CreateInstitutionInput,
  CreateInstitutionAdminInput,
  CreateRoleUserInput,
  CreateTrainerRequestInput,
};
