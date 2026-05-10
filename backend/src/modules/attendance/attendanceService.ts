import { Role, type User } from "@prisma/client";

import prisma from "../../config/db";
import { recordAuditEvent } from "../audit/auditService";
import { publishRealtimeEvent } from "../realtime/realtimeService";

import type { MarkAttendanceInput } from "./attendanceTypes";
import type { PaginationParams } from "../../utils/pagination";

const markAttendance = async (input: MarkAttendanceInput, currentUser: User) => {
  if (currentUser.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  if (!currentUser.institutionId) {
    throw new Error("TRAINER_INSTITUTION_REQUIRED");
  }

  const session = await prisma.session.findUnique({
    where: { id: input.sessionId },
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: session.batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  if (currentUser.institutionId !== batch.institutionId) {
    throw new Error("UNAUTHORIZED_SESSION_ACCESS");
  }

  const trainerAssignment = await prisma.batchTrainer.findUnique({
    where: {
      batchId_trainerId: {
        batchId: session.batchId,
        trainerId: currentUser.id,
      },
    },
  });

  if (!trainerAssignment) {
    throw new Error("TRAINER_NOT_ASSIGNED_TO_SESSION_BATCH");
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: input.sessionId,
        studentId: input.studentId,
      },
    },
  });

  if (existingAttendance) {
    const updatedAttendance = await prisma.attendance.update({
      where: {
        sessionId_studentId: {
          sessionId: input.sessionId,
          studentId: input.studentId,
        },
      },
      data: {
        status: input.status,
        markedAt: new Date(),
      },
    });

    publishRealtimeEvent("attendance.marked", {
      institutionId: batch.institutionId,
      trainerId: currentUser.id,
      studentId: input.studentId,
      batchId: session.batchId,
      sessionId: input.sessionId,
    });

    await recordAuditEvent({
      actorId: currentUser.id,
      actorRole: currentUser.role,
      eventType: "attendance.marked",
      entityType: "attendance",
      entityId: updatedAttendance.id,
      metadata: {
        sessionId: input.sessionId,
        studentId: input.studentId,
        status: input.status,
      },
    });

    return updatedAttendance;
  }

  const studentInBatch = await prisma.batchStudent.findUnique({
    where: {
      batchId_studentId: {
        batchId: session.batchId,
        studentId: input.studentId,
      },
    },
  });

  if (!studentInBatch) {
    throw new Error("STUDENT_NOT_IN_BATCH");
  }

  const attendance = await prisma.attendance.create({
    data: {
      sessionId: input.sessionId,
      studentId: input.studentId,
      status: input.status,
      markedAt: new Date(),
    },
  });

  publishRealtimeEvent("attendance.marked", {
    institutionId: batch.institutionId,
    trainerId: currentUser.id,
    studentId: input.studentId,
    batchId: session.batchId,
    sessionId: input.sessionId,
  });

  await recordAuditEvent({
    actorId: currentUser.id,
    actorRole: currentUser.role,
    eventType: "attendance.marked",
    entityType: "attendance",
    entityId: attendance.id,
    metadata: {
      sessionId: input.sessionId,
      studentId: input.studentId,
      status: input.status,
    },
  });

  return attendance;
};

const getStudentAttendance = async (currentUser: User, pagination: PaginationParams) => {
  if (currentUser.role !== Role.STUDENT) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const where = {
    batch: {
      students: {
        some: {
          studentId: currentUser.id,
        },
      },
    },
  };

  const [totalItems, sessions] = await prisma.$transaction([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
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
            studentId: currentUser.id,
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
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  const items = sessions.map((session) => ({
    sessionId: session.id,
    title: session.title,
    batchName: session.batch.name,
    date: session.date,
    status: session.attendance[0]?.status ?? null,
  }));

  return {
    items,
    totalItems,
  };
};

export { getStudentAttendance, markAttendance };
