import { Role } from "@prisma/client";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  role: z.nativeEnum(Role),
  clerkUserId: z.string().trim().min(1),
});

const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

const userQuerySchema = z.object({}).passthrough();

type CreateUserInput = {
  name: string;
  role: Role;
  clerkUserId: string;
};

export { createUserSchema, userIdParamSchema, userQuerySchema };
export type { CreateUserInput };
