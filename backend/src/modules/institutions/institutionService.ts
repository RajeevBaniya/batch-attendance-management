import { Role, User } from "@prisma/client";

import prisma from "../../config/db";
import { hashPassword } from "../../utils/password";
import type {
  CreateInstitutionAdminInput,
  CreateInstitutionInput,
  CreateRoleUserInput,
  CreateTrainerRequestInput,
} from "./institutionTypes";

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

  return prisma.institution.create({
    data: {
      name: input.name,
      createdBySuperAdminId: currentUser.id,
    },
  });
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

  return prisma.trainerRequest.create({
    data: {
      requesterId: currentUser.id,
      institutionId: input.institutionId,
    },
  });
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

  return prisma.$transaction(async (transaction) => {
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
};

const getTrainerRequests = async (currentUser: User) => {
  assertInstitutionAdmin(currentUser);

  return prisma.trainerRequest.findMany({
    where: {
      institutionId: currentUser.institutionId ?? undefined,
    },
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
  });
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
