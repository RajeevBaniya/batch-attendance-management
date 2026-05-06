import { AttendanceStatus } from "@prisma/client";
import { z } from "zod";

const markAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.nativeEnum(AttendanceStatus),
});

const attendanceQuerySchema = z.object({}).passthrough();

type MarkAttendanceInput = {
  sessionId: string;
  status: AttendanceStatus;
};

export { markAttendanceSchema, attendanceQuerySchema };
export type { MarkAttendanceInput };
