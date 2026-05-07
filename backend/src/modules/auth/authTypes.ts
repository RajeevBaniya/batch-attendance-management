import { z } from "zod";

const authQuerySchema = z.object({}).passthrough();

export { authQuerySchema };
