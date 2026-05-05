import { z } from "zod";

const createSessionSchema = z.object({
  batchId: z.string().uuid(),
  title: z.string().trim().min(1),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

const sessionIdParamSchema = z.object({
  id: z.string().uuid(),
});

const sessionQuerySchema = z.object({}).passthrough();

type CreateSessionInput = {
  batchId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

export { createSessionSchema, sessionIdParamSchema, sessionQuerySchema };
export type { CreateSessionInput };
