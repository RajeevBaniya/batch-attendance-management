import { AttendanceStatus, Role } from "@prisma/client";

import prisma from "../../config/db";
import { toCsv } from "../../utils/csv";
import { recordAuditEvent } from "../audit/auditService";

import { EXPORT_MAX_ROWS, type ExportActor, type ExportFilterInput } from "./reportTypes";

const resolveDateLowerBound = (datePreset: ExportFilterInput["datePreset"]) => {
  if (!datePreset || datePreset === "ALL") {
    return undefined;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (datePreset === "TODAY") {
    return startOfToday;
  }

  const daysBack = datePreset === "LAST_7_DAYS" ? 7 : 30;
  const lowerBound = new Date(startOfToday);
  lowerBound.setDate(lowerBound.getDate() - daysBack);
  return lowerBound;
};

const normalizeStatus = (status: ExportFilterInput["status"]) => {
  if (!status || status === "ALL") {
    return undefined;
  }
  return status as AttendanceStatus;
};

const auditReportExport = async (actor: ExportActor, reportType: string, rowCount: number) => {
  await recordAuditEvent({
    actorId: actor.id,
    actorRole: actor.role,
    eventType: "report.exported",
    entityType: "report",
    entityId: reportType,
    metadata: {
      rowCount,
      reportType,
    },
  });
};

const exportTrainerAttendanceCsv = async (actor: ExportActor, filters: ExportFilterInput) => {
  if (actor.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const dateLowerBound = resolveDateLowerBound(filters.datePreset);
  const status = normalizeStatus(filters.status);
  const search = filters.search?.toLowerCase();

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      status,
      sessionId: filters.sessionId,
      session: {
        trainerId: actor.id,
        batchId: filters.batchId,
        ...(dateLowerBound
          ? {
              date: {
                gte: dateLowerBound,
              },
            }
          : {}),
      },
    },
    select: {
      id: true,
      status: true,
      markedAt: true,
      student: {
        select: {
          name: true,
        },
      },
      session: {
        select: {
          title: true,
          date: true,
          batch: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      markedAt: "desc",
    },
    take: EXPORT_MAX_ROWS,
  });

  const filteredRecords = attendanceRecords.filter((record) => {
    if (!search) {
      return true;
    }
    return `${record.student.name} ${record.session.title} ${record.session.batch.name}`
      .toLowerCase()
      .includes(search);
  });

  const rows = filteredRecords.map((record) => ({
    "Attendance Id": record.id,
    Session: record.session.title,
    Batch: record.session.batch.name,
    Student: record.student.name,
    Status: record.status,
    "Session Date": record.session.date.toISOString(),
    "Marked At": record.markedAt.toISOString(),
  }));

  await auditReportExport(actor, "trainer-attendance", rows.length);
  return toCsv(["Attendance Id", "Session", "Batch", "Student", "Status", "Session Date", "Marked At"], rows);
};

const exportInstitutionAttendanceSummaryCsv = async (actor: ExportActor, filters: ExportFilterInput) => {
  const canAccessCrossInstitution =
    actor.role === Role.PROGRAMME_MANAGER || actor.role === Role.MONITORING_OFFICER || actor.role === Role.SUPER_ADMIN;
  const resolvedInstitutionId = canAccessCrossInstitution ? filters.institutionId : actor.institutionId;

  if (!resolvedInstitutionId) {
    throw new Error("UNAUTHORIZED_INSTITUTION_ACCESS");
  }

  if (actor.role === Role.INSTITUTION && resolvedInstitutionId !== actor.institutionId) {
    throw new Error("UNAUTHORIZED_INSTITUTION_ACCESS");
  }

  const dateLowerBound = resolveDateLowerBound(filters.datePreset);
  const status = normalizeStatus(filters.status);

  const sessions = await prisma.session.findMany({
    where: {
      batchId: filters.batchId,
      batch: {
        institutionId: resolvedInstitutionId,
      },
      ...(dateLowerBound
        ? {
            date: {
              gte: dateLowerBound,
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      date: true,
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      attendance: {
        where: {
          status,
        },
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: EXPORT_MAX_ROWS,
  });

  const rows = sessions.map((session) => {
    const presentCount = session.attendance.filter((entry) => entry.status === AttendanceStatus.PRESENT).length;
    const absentCount = session.attendance.filter((entry) => entry.status === AttendanceStatus.ABSENT).length;
    const totalMarked = presentCount + absentCount;
    const attendancePercentage = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(2) : "0.00";

    return {
      "Session Id": session.id,
      Session: session.title,
      "Session Date": session.date.toISOString(),
      "Batch Id": session.batch.id,
      Batch: session.batch.name,
      Present: String(presentCount),
      Absent: String(absentCount),
      "Attendance %": attendancePercentage,
    };
  });

  await auditReportExport(actor, "institution-attendance-summary", rows.length);
  return toCsv(
    ["Session Id", "Session", "Session Date", "Batch Id", "Batch", "Present", "Absent", "Attendance %"],
    rows,
  );
};

const exportStudentAttendanceCsv = async (actor: ExportActor, filters: ExportFilterInput) => {
  if (actor.role !== Role.STUDENT) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const dateLowerBound = resolveDateLowerBound(filters.datePreset);
  const status = normalizeStatus(filters.status);
  const search = filters.search?.toLowerCase();

  const sessions = await prisma.session.findMany({
    where: {
      batchId: filters.batchId,
      ...(dateLowerBound
        ? {
            date: {
              gte: dateLowerBound,
            },
          }
        : {}),
      batch: {
        students: {
          some: {
            studentId: actor.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
      batch: {
        select: {
          name: true,
        },
      },
      attendance: {
        where: {
          studentId: actor.id,
          status,
        },
        select: {
          status: true,
        },
        take: 1,
      },
    },
    orderBy: {
      date: "desc",
    },
    take: EXPORT_MAX_ROWS,
  });

  const rows = sessions
    .map((session) => ({
      "Session Id": session.id,
      Session: session.title,
      Batch: session.batch.name,
      "Session Date": session.date.toISOString(),
      Status: session.attendance[0]?.status ?? "NOT_MARKED",
    }))
    .filter((row) => {
      if (!search) {
        return true;
      }
      return `${row.Session} ${row.Batch}`.toLowerCase().includes(search);
    });

  await auditReportExport(actor, "student-attendance-history", rows.length);
  return toCsv(["Session Id", "Session", "Batch", "Session Date", "Status"], rows);
};

const exportProgrammeSummaryCsv = async (actor: ExportActor) => {
  if (
    actor.role !== Role.PROGRAMME_MANAGER &&
    actor.role !== Role.MONITORING_OFFICER &&
    actor.role !== Role.SUPER_ADMIN
  ) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const institutions = await prisma.institution.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: EXPORT_MAX_ROWS,
  });

  const rows = await Promise.all(
    institutions.map(async (institution) => {
      const batches = await prisma.batch.findMany({
        where: {
          institutionId: institution.id,
        },
        select: {
          id: true,
        },
      });
      const batchIds = batches.map((batch) => batch.id);
      const sessions = batchIds.length
        ? await prisma.session.findMany({
            where: {
              batchId: {
                in: batchIds,
              },
            },
            select: {
              id: true,
            },
          })
        : [];
      const sessionIds = sessions.map((session) => session.id);

      const [studentsCount, attendanceEntries] = await Promise.all([
        batchIds.length
          ? prisma.batchStudent.count({
              where: {
                batchId: {
                  in: batchIds,
                },
              },
            })
          : 0,
        sessionIds.length
          ? prisma.attendance.findMany({
              where: {
                sessionId: {
                  in: sessionIds,
                },
              },
              select: {
                status: true,
              },
            })
          : [],
      ]);

      const presentCount = attendanceEntries.filter((entry) => entry.status === AttendanceStatus.PRESENT).length;
      const absentCount = attendanceEntries.filter((entry) => entry.status === AttendanceStatus.ABSENT).length;
      const totalMarked = presentCount + absentCount;
      const attendancePercentage = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(2) : "0.00";

      return {
        "Institution Id": institution.id,
        Institution: institution.name,
        Batches: String(batchIds.length),
        Students: String(studentsCount),
        Sessions: String(sessionIds.length),
        Present: String(presentCount),
        Absent: String(absentCount),
        "Attendance %": attendancePercentage,
      };
    }),
  );

  await auditReportExport(actor, "programme-operational-summary", rows.length);
  return toCsv(
    ["Institution Id", "Institution", "Batches", "Students", "Sessions", "Present", "Absent", "Attendance %"],
    rows,
  );
};

export {
  exportInstitutionAttendanceSummaryCsv,
  exportProgrammeSummaryCsv,
  exportStudentAttendanceCsv,
  exportTrainerAttendanceCsv,
};
