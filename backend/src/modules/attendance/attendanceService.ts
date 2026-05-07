import { Role, User } from "@prisma/client";

import prisma from "../../config/db";
import type { MarkAttendanceInput } from "./attendanceTypes";

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
    return prisma.attendance.update({
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

  return attendance;
};

const getStudentAttendance = async (currentUser: User) => {
  if (currentUser.role !== Role.STUDENT) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const records = await prisma.batchStudent.findMany({
    where: {
      studentId: currentUser.id,
    },
    select: {
      batch: {
        select: {
          name: true,
          sessions: {
            select: {
              id: true,
              title: true,
              date: true,
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
          },
        },
      },
    },
  });

  return records.flatMap((record) =>
    record.batch.sessions.map((session) => ({
      sessionId: session.id,
      title: session.title,
      batchName: record.batch.name,
      date: session.date,
      status: session.attendance[0]?.status ?? null,
    })),
  );
};

export { getStudentAttendance, markAttendance };
