import { Role } from "@prisma/client";

import prisma from "../../config/db";
import type { CreateUserInput } from "./userTypes";

const createUser = async (input: CreateUserInput) => {
  const validRoles = Object.values(Role);
  if (!validRoles.includes(input.role)) {
    throw new Error("INVALID_ROLE");
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
  });

  return user;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export { createUser, getUserById };
