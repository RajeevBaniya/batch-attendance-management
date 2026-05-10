import { type Role } from "@prisma/client";
import { z } from "zod";

const EXPORT_MAX_ROWS = 5000;

const datePresetSchema = z.enum(["ALL", "TODAY", "LAST_7_DAYS", "LAST_30_DAYS"]).default("ALL");
const attendanceStatusFilterSchema = z.enum(["ALL", "PRESENT", "ABSENT"]).default("ALL");

const exportFilterSchema = z.object({
  datePreset: datePresetSchema.optional(),
  status: attendanceStatusFilterSchema.optional(),
  batchId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

type ExportFilterInput = z.infer<typeof exportFilterSchema>;

type ExportActor = {
  id: string;
  role: Role;
  institutionId: string | null;
};

export { EXPORT_MAX_ROWS, exportFilterSchema };
export type { ExportActor, ExportFilterInput };
