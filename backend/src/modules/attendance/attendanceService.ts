import { Role, User } from "@prisma/client";

import prisma from "../../config/db";
import type { MarkAttendanceInput } from "./attendanceTypes";

const markAttendance = async (input: MarkAttendanceInput, currentUser: User) => {
  if (currentUser.role !== Role.STUDENT) {
    throw new Error("ROLE_NOT_ALLOWED");
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

  if (currentUser.institutionId && currentUser.institutionId !== batch.institutionId) {
    throw new Error("UNAUTHORIZED_SESSION_ACCESS");
  }

  const studentAssignment = await prisma.batchStudent.findUnique({
    where: {
      batchId_studentId: {
        batchId: session.batchId,
        studentId: currentUser.id,
      },
    },
  });

  if (!studentAssignment) {
    throw new Error("STUDENT_NOT_IN_BATCH");
  }

  const currentTime = Date.now();
  const sessionStart = session.startTime.getTime();
  const sessionEnd = session.endTime.getTime();

  if (currentTime < sessionStart || currentTime > sessionEnd) {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: input.sessionId,
        studentId: currentUser.id,
      },
    },
  });

  if (existingAttendance) {
    throw new Error("ATTENDANCE_ALREADY_MARKED");
  }

  const attendance = await prisma.attendance.create({
    data: {
      sessionId: input.sessionId,
      studentId: currentUser.id,
      status: input.status,
      markedAt: new Date(),
    },
  });

  return attendance;
};

export { markAttendance };
