import type { DatePresetFilter } from "../utils/dataFilters";

type AttendanceStatusFilter = "ALL" | "PRESENT" | "ABSENT";

type BaseReportFilter = {
  datePreset?: DatePresetFilter;
  status?: AttendanceStatusFilter;
  batchId?: string;
  sessionId?: string;
  search?: string;
  institutionId?: string;
};

export type { AttendanceStatusFilter, BaseReportFilter };
