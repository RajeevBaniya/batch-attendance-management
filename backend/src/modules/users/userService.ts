import { Role } from "@prisma/client";

import prisma from "../../config/db";

import type { CreateUserInput } from "./userTypes";

const userPublicSelect = {
  id: true,
  clerkUserId: true,
  email: true,
  name: true,
  role: true,
  institutionId: true,
  createdAt: true,
} as const;

const createUser = async (input: CreateUserInput) => {
  const validRoles = Object.values(Role);
  if (!validRoles.includes(input.role)) {
    throw new Error("INVALID_ROLE");
  }

  if (!input.clerkUserId || input.clerkUserId.trim() === "") {
    throw new Error("INVALID_CLERK_USER_ID");
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: input.clerkUserId },
  });

  if (existingUser) {
    throw new Error("CLERK_USER_ID_EXISTS");
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      role: input.role,
      clerkUserId: input.clerkUserId,
    },
    select: userPublicSelect,
  });

  return user;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userPublicSelect,
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export { createUser, getUserById };
