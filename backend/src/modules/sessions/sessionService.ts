import { Role, type User } from "@prisma/client";

import prisma from "../../config/db";
import { recordAuditEvent } from "../audit/auditService";
import { publishRealtimeEvent } from "../realtime/realtimeService";

import type { CreateSessionInput } from "./sessionTypes";
import type { PaginationParams } from "../../utils/pagination";

const createSession = async (input: CreateSessionInput, currentUser: User) => {
  if (currentUser.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  if (!currentUser.institutionId) {
    throw new Error("TRAINER_INSTITUTION_REQUIRED");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: input.batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  if (batch.institutionId !== currentUser.institutionId) {
    throw new Error("UNAUTHORIZED_BATCH_ACCESS");
  }

  const trainerAssignment = await prisma.batchTrainer.findUnique({
    where: {
      batchId_trainerId: {
        batchId: input.batchId,
        trainerId: currentUser.id,
      },
    },
  });

  if (!trainerAssignment) {
    throw new Error("TRAINER_NOT_ASSIGNED_TO_SESSION_BATCH");
  }

  const dateUtc = new Date(input.date);
  const startTimeUtc = new Date(input.startTime);
  const endTimeUtc = new Date(input.endTime);

  const sessionDate = dateUtc.toISOString().split("T")[0];
  const startDate = startTimeUtc.toISOString().split("T")[0];
  const endDate = endTimeUtc.toISOString().split("T")[0];

  if (startDate !== sessionDate || endDate !== sessionDate) {
    throw new Error("INVALID_SESSION_DATE");
  }

  if (startTimeUtc.getTime() >= endTimeUtc.getTime()) {
    throw new Error("INVALID_SESSION_TIME");
  }

  const session = await prisma.session.create({
    data: {
      batchId: input.batchId,
      trainerId: currentUser.id,
      title: input.title,
      date: dateUtc,
      startTime: startTimeUtc,
      endTime: endTimeUtc,
    },
  });

  publishRealtimeEvent("session.created", {
    institutionId: batch.institutionId,
    trainerId: currentUser.id,
    batchId: input.batchId,
    sessionId: session.id,
  });

  await recordAuditEvent({
    actorId: currentUser.id,
    actorRole: currentUser.role,
    eventType: "session.created",
    entityType: "session",
    entityId: session.id,
    metadata: {
      batchId: input.batchId,
      institutionId: batch.institutionId,
    },
  });

  return session;
};

const getSessionAttendance = async (sessionId: string, currentUser: User) => {
  if (currentUser.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  if (!currentUser.institutionId) {
    throw new Error("TRAINER_INSTITUTION_REQUIRED");
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      batch: true,
      attendance: true,
    },
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.batch.institutionId !== currentUser.institutionId) {
    throw new Error("UNAUTHORIZED_BATCH_ACCESS");
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

  const batchStudents = await prisma.batchStudent.findMany({
    where: { batchId: session.batchId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const attendanceByStudentId = new Map(
    session.attendance.map((entry) => [entry.studentId, entry.status]),
  );

  const students = batchStudents.map((entry) => ({
    studentId: entry.student.id,
    studentName: entry.student.name,
    status: attendanceByStudentId.get(entry.student.id) ?? null,
  }));

  return {
    sessionId: session.id,
    batchId: session.batchId,
    students,
  };
};

const getTrainerSessions = async (currentUser: User, pagination: PaginationParams) => {
  if (currentUser.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const where = {
    trainerId: currentUser.id,
  };

  const [totalItems, items] = await prisma.$transaction([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        batch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  return {
    items,
    totalItems,
  };
};

export { createSession, getSessionAttendance, getTrainerSessions };
