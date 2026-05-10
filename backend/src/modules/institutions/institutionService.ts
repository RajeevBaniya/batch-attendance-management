import { Role, type User } from "@prisma/client";

import prisma from "../../config/db";
import { hashPassword } from "../../utils/password";
import { recordAuditEvent } from "../audit/auditService";
import { publishRealtimeEvent } from "../realtime/realtimeService";

import type {
  CreateInstitutionAdminInput,
  CreateInstitutionInput,
  CreateRoleUserInput,
  CreateTrainerRequestInput,
} from "./institutionTypes";
import type { PaginationParams } from "../../utils/pagination";

const assertSuperAdmin = (currentUser: User) => {
  if (currentUser.role !== Role.SUPER_ADMIN) {
    throw new Error("ROLE_NOT_ALLOWED");
  }
};

const assertInstitutionAdmin = (currentUser: User) => {
  if (currentUser.role !== Role.INSTITUTION || !currentUser.institutionId) {
    throw new Error("ROLE_NOT_ALLOWED");
  }
};

const userPublicSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  name: true,
  role: true,
  institutionId: true,
  createdAt: true,
} as const;

const createInstitution = async (input: CreateInstitutionInput, currentUser: User) => {
  assertSuperAdmin(currentUser);

  const institution = await prisma.institution.create({
    data: {
      name: input.name,
      createdBySuperAdminId: currentUser.id,
    },
  });

  await recordAuditEvent({
    actorId: currentUser.id,
    actorRole: currentUser.role,
    eventType: "institution.created",
    entityType: "institution",
    entityId: institution.id,
    metadata: {
      institutionName: institution.name,
    },
  });

  return institution;
};

const listInstitutions = async (currentUser: User) => {
  assertSuperAdmin(currentUser);

  return prisma.institution.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const createInstitutionAdmin = async (
  institutionId: string,
  input: CreateInstitutionAdminInput,
  currentUser: User,
) => {
  assertSuperAdmin(currentUser);

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });
  if (!institution) {
    throw new Error("INSTITUTION_NOT_FOUND");
  }

  const existingEmailUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmailUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: Role.INSTITUTION,
      institutionId,
    },
    select: userPublicSelect,
  });
};

const createProgrammeManager = async (input: CreateRoleUserInput, currentUser: User) => {
  assertSuperAdmin(currentUser);

  const existingEmailUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmailUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const existingClerkUser = await prisma.user.findUnique({
    where: { clerkUserId: input.clerkUserId },
  });
  if (existingClerkUser) {
    throw new Error("CLERK_USER_ID_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      clerkUserId: input.clerkUserId,
      role: Role.PROGRAMME_MANAGER,
    },
    select: userPublicSelect,
  });
};

const createMonitoringOfficer = async (input: CreateRoleUserInput, currentUser: User) => {
  assertSuperAdmin(currentUser);

  const existingEmailUser = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existingEmailUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const existingClerkUser = await prisma.user.findUnique({
    where: { clerkUserId: input.clerkUserId },
  });
  if (existingClerkUser) {
    throw new Error("CLERK_USER_ID_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      clerkUserId: input.clerkUserId,
      role: Role.MONITORING_OFFICER,
    },
    select: userPublicSelect,
  });
};

const createTrainerRequest = async (input: CreateTrainerRequestInput, currentUser: User) => {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const institution = await prisma.institution.findUnique({
    where: { id: input.institutionId },
  });
  if (!institution) {
    throw new Error("INSTITUTION_NOT_FOUND");
  }

  const existingRequest = await prisma.trainerRequest.findUnique({
    where: {
      requesterId_institutionId: {
        requesterId: currentUser.id,
        institutionId: input.institutionId,
      },
    },
  });
  if (existingRequest) {
    throw new Error("TRAINER_REQUEST_ALREADY_EXISTS");
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      role: Role.PENDING_TRAINER,
      institutionId: input.institutionId,
    },
  });

  const trainerRequest = await prisma.trainerRequest.create({
    data: {
      requesterId: currentUser.id,
      institutionId: input.institutionId,
    },
  });

  await recordAuditEvent({
    actorId: currentUser.id,
    actorRole: currentUser.role,
    eventType: "trainer.request.created",
    entityType: "trainer_request",
    entityId: trainerRequest.id,
    metadata: {
      institutionId: input.institutionId,
    },
  });

  return trainerRequest;
};

const approveTrainerRequest = async (trainerRequestId: string, currentUser: User) => {
  assertInstitutionAdmin(currentUser);

  const request = await prisma.trainerRequest.findUnique({
    where: { id: trainerRequestId },
  });
  if (!request) {
    throw new Error("TRAINER_REQUEST_NOT_FOUND");
  }

  if (request.institutionId !== currentUser.institutionId) {
    throw new Error("UNAUTHORIZED_INSTITUTION_ACCESS");
  }

  if (request.approvedAt) {
    throw new Error("TRAINER_REQUEST_ALREADY_APPROVED");
  }

  const result = await prisma.$transaction(async (transaction) => {
    const updatedUser = await transaction.user.update({
      where: { id: request.requesterId },
      data: {
        role: Role.TRAINER,
        institutionId: request.institutionId,
      },
      select: userPublicSelect,
    });

    const updatedRequest = await transaction.trainerRequest.update({
      where: { id: trainerRequestId },
      data: {
        approvedById: currentUser.id,
        approvedAt: new Date(),
      },
    });

    return {
      user: updatedUser,
      request: updatedRequest,
    };
  });

  publishRealtimeEvent("trainer.request.approved", {
    institutionId: request.institutionId,
    trainerId: result.user.id,
    requesterId: request.requesterId,
  });

  await recordAuditEvent({
    actorId: currentUser.id,
    actorRole: currentUser.role,
    eventType: "trainer.request.approved",
    entityType: "trainer_request",
    entityId: result.request.id,
    metadata: {
      institutionId: request.institutionId,
      requesterId: request.requesterId,
    },
  });

  return result;
};

const getTrainerRequests = async (currentUser: User, pagination: PaginationParams) => {
  assertInstitutionAdmin(currentUser);

  const where = {
    institutionId: currentUser.institutionId ?? undefined,
  };

  const [totalItems, items] = await prisma.$transaction([
    prisma.trainerRequest.count({ where }),
    prisma.trainerRequest.findMany({
      where,
      select: {
        id: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
        approvedAt: true,
      },
      orderBy: {
        createdAt: "desc",
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

const getInstitutionTrainers = async (currentUser: User) => {
  assertInstitutionAdmin(currentUser);

  return prisma.user.findMany({
    where: {
      role: Role.TRAINER,
      institutionId: currentUser.institutionId ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export {
  createInstitution,
  listInstitutions,
  createInstitutionAdmin,
  createProgrammeManager,
  createMonitoringOfficer,
  createTrainerRequest,
  getTrainerRequests,
  getInstitutionTrainers,
  approveTrainerRequest,
};
