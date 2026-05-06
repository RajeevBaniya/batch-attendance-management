import crypto from "node:crypto";

import { Role, User } from "@prisma/client";

import prisma from "../../config/db";
import type { AssignStudentInput, AssignTrainerInput, CreateBatchInput, JoinBatchInput } from "./batchTypes";

const createBatch = async (input: CreateBatchInput, user: User) => {
  if (user.role !== Role.TRAINER && user.role !== Role.INSTITUTION) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  let institutionId: string;

  if (user.role === Role.INSTITUTION) {
    institutionId = user.id;
  } else if (user.institutionId) {
    institutionId = user.institutionId;
  } else {
    throw new Error("TRAINER_INSTITUTION_REQUIRED");
  }

  const batch = await prisma.batch.create({
    data: {
      name: input.name,
      institutionId,
    },
  });

  return batch;
};

const assertBatchOwnership = (batchInstitutionId: string, currentUser: User) => {
  if (currentUser.role === Role.INSTITUTION && batchInstitutionId !== currentUser.id) {
    throw new Error("UNAUTHORIZED_BATCH_ACCESS");
  }

  if (
    currentUser.role === Role.TRAINER &&
    (!currentUser.institutionId || batchInstitutionId !== currentUser.institutionId)
  ) {
    throw new Error("UNAUTHORIZED_BATCH_ACCESS");
  }
};

const assignTrainerToBatch = async (batchId: string, input: AssignTrainerInput, currentUser: User) => {
  if (currentUser.role !== Role.INSTITUTION) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  assertBatchOwnership(batch.institutionId, currentUser);

  const trainer = await prisma.user.findUnique({
    where: { id: input.trainerId },
  });

  if (!trainer) {
    throw new Error("TRAINER_NOT_FOUND");
  }

  if (trainer.role !== Role.TRAINER) {
    throw new Error("INVALID_TRAINER_ROLE");
  }

  if (!trainer.institutionId || trainer.institutionId !== batch.institutionId) {
    throw new Error("TRAINER_INSTITUTION_MISMATCH");
  }

  const existingAssignment = await prisma.batchTrainer.findUnique({
    where: {
      batchId_trainerId: {
        batchId,
        trainerId: input.trainerId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error("TRAINER_ALREADY_ASSIGNED");
  }

  const assignment = await prisma.batchTrainer.create({
    data: {
      batchId,
      trainerId: input.trainerId,
    },
  });

  return assignment;
};

const assignStudentToBatch = async (batchId: string, input: AssignStudentInput, currentUser: User) => {
  if (currentUser.role !== Role.INSTITUTION && currentUser.role !== Role.TRAINER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  assertBatchOwnership(batch.institutionId, currentUser);

  if (currentUser.role === Role.TRAINER) {
    const trainerAssignment = await prisma.batchTrainer.findUnique({
      where: {
        batchId_trainerId: {
          batchId,
          trainerId: currentUser.id,
        },
      },
    });

    if (!trainerAssignment) {
      throw new Error("TRAINER_NOT_ASSIGNED_TO_BATCH");
    }
  }

  const student = await prisma.user.findUnique({
    where: { id: input.studentId },
  });

  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  if (student.role !== Role.STUDENT) {
    throw new Error("INVALID_STUDENT_ROLE");
  }

  const existingAssignment = await prisma.batchStudent.findUnique({
    where: {
      batchId_studentId: {
        batchId,
        studentId: input.studentId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error("STUDENT_ALREADY_ASSIGNED");
  }

  const assignment = await prisma.batchStudent.create({
    data: {
      batchId,
      studentId: input.studentId,
    },
  });

  return assignment;
};

const generateInvite = async (batchId: string, currentUser: User) => {
  if (currentUser.role !== Role.TRAINER && currentUser.role !== Role.INSTITUTION) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  assertBatchOwnership(batch.institutionId, currentUser);

  if (currentUser.role === Role.TRAINER) {
    const trainerAssignment = await prisma.batchTrainer.findUnique({
      where: {
        batchId_trainerId: {
          batchId,
          trainerId: currentUser.id,
        },
      },
    });

    if (!trainerAssignment) {
      throw new Error("TRAINER_NOT_ASSIGNED_TO_BATCH");
    }
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      token,
      batchId,
      createdBy: currentUser.id,
      expiresAt,
    },
  });

  return {
    token: invite.token,
    expiresAt: invite.expiresAt,
  };
};

const joinBatchWithInvite = async (input: JoinBatchInput, currentUser: User) => {
  if (currentUser.role !== Role.STUDENT) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const invite = await prisma.invite.findUnique({
    where: { token: input.token },
  });

  if (!invite) {
    throw new Error("INVITE_NOT_FOUND");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error("INVITE_EXPIRED");
  }

  const existingAssignment = await prisma.batchStudent.findUnique({
    where: {
      batchId_studentId: {
        batchId: invite.batchId,
        studentId: currentUser.id,
      },
    },
  });

  if (existingAssignment) {
    throw new Error("STUDENT_ALREADY_ASSIGNED");
  }

  const assignment = await prisma.batchStudent.create({
    data: {
      batchId: invite.batchId,
      studentId: currentUser.id,
    },
  });

  return assignment;
};

const getBatchSummary = async (batchId: string, currentUser: User) => {
  if (currentUser.role !== Role.INSTITUTION && currentUser.role !== Role.PROGRAMME_MANAGER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error("BATCH_NOT_FOUND");
  }

  if (currentUser.role === Role.INSTITUTION && batch.institutionId !== currentUser.id) {
    throw new Error("UNAUTHORIZED_BATCH_ACCESS");
  }

  const [totalStudents, batchSessions] = await Promise.all([
    prisma.batchStudent.count({
      where: { batchId },
    }),
    prisma.session.findMany({
      where: { batchId },
      select: { id: true },
    }),
  ]);

  const totalSessions = batchSessions.length;
  const batchSessionIds = batchSessions.map((session) => session.id);

  const attendanceCounts =
    batchSessionIds.length > 0
      ? await prisma.attendance.groupBy({
          by: ["status"],
          where: {
            sessionId: {
              in: batchSessionIds,
            },
          },
          _count: {
            status: true,
          },
        })
      : [];

  const presentCount =
    attendanceCounts.find((entry) => entry.status === "PRESENT")?._count.status ?? 0;
  const absentCount =
    attendanceCounts.find((entry) => entry.status === "ABSENT")?._count.status ?? 0;
  const totalAttendanceRecords = presentCount + absentCount;

  const attendancePercentageRaw =
    totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;
  const attendancePercentage = Number(attendancePercentageRaw.toFixed(2));

  return {
    batchId,
    totalStudents,
    totalSessions,
    presentCount,
    absentCount,
    attendancePercentage,
  };
};

const getInstitutionSummary = async (institutionId: string, currentUser: User) => {
  if (currentUser.role !== Role.INSTITUTION && currentUser.role !== Role.PROGRAMME_MANAGER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  if (currentUser.role === Role.INSTITUTION && currentUser.id !== institutionId) {
    throw new Error("UNAUTHORIZED_INSTITUTION_ACCESS");
  }

  const institutionBatches = await prisma.batch.findMany({
    where: { institutionId },
    select: { id: true },
  });

  const totalBatches = institutionBatches.length;
  const batchIds = institutionBatches.map((batch) => batch.id);

  const [totalStudents, institutionSessions] = await Promise.all([
    batchIds.length > 0
      ? prisma.batchStudent.count({
          where: {
            batchId: {
              in: batchIds,
            },
          },
        })
      : 0,
    batchIds.length > 0
      ? prisma.session.findMany({
          where: {
            batchId: {
              in: batchIds,
            },
          },
          select: { id: true },
        })
      : [],
  ]);

  const totalSessions = institutionSessions.length;
  const sessionIds = institutionSessions.map((session) => session.id);

  const attendanceCounts =
    sessionIds.length > 0
      ? await prisma.attendance.groupBy({
          by: ["status"],
          where: {
            sessionId: {
              in: sessionIds,
            },
          },
          _count: {
            status: true,
          },
        })
      : [];

  const presentCount =
    attendanceCounts.find((entry) => entry.status === "PRESENT")?._count.status ?? 0;
  const absentCount =
    attendanceCounts.find((entry) => entry.status === "ABSENT")?._count.status ?? 0;
  const totalAttendanceRecords = presentCount + absentCount;

  const attendancePercentageRaw =
    totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;
  const attendancePercentage = Number(attendancePercentageRaw.toFixed(2));

  return {
    institutionId,
    totalBatches,
    totalStudents,
    totalSessions,
    presentCount,
    absentCount,
    attendancePercentage,
  };
};

const getProgrammeSummary = async (currentUser: User) => {
  if (currentUser.role !== Role.PROGRAMME_MANAGER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const [totalInstitutions, totalBatches, totalStudents, sessions] = await Promise.all([
    prisma.user.count({
      where: { role: Role.INSTITUTION },
    }),
    prisma.batch.count(),
    prisma.batchStudent.count(),
    prisma.session.findMany({
      select: { id: true },
    }),
  ]);

  const totalSessions = sessions.length;
  const sessionIds = sessions.map((session) => session.id);

  const attendanceCounts =
    sessionIds.length > 0
      ? await prisma.attendance.groupBy({
          by: ["status"],
          where: {
            sessionId: {
              in: sessionIds,
            },
          },
          _count: {
            status: true,
          },
        })
      : [];

  const presentCount =
    attendanceCounts.find((entry) => entry.status === "PRESENT")?._count.status ?? 0;
  const absentCount =
    attendanceCounts.find((entry) => entry.status === "ABSENT")?._count.status ?? 0;
  const totalAttendanceRecords = presentCount + absentCount;

  const attendancePercentageRaw =
    totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;
  const attendancePercentage = Number(attendancePercentageRaw.toFixed(2));

  return {
    totalInstitutions,
    totalBatches,
    totalStudents,
    totalSessions,
    presentCount,
    absentCount,
    attendancePercentage,
  };
};

export {
  createBatch,
  assignTrainerToBatch,
  assignStudentToBatch,
  generateInvite,
  joinBatchWithInvite,
  getBatchSummary,
  getInstitutionSummary,
  getProgrammeSummary,
};
