import prisma from "../../config/db";

type SyncAuthenticatedUserInput = {
  clerkUserId: string;
  email?: string;
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

const syncAuthenticatedUser = async (input: SyncAuthenticatedUserInput) => {
  if (!input.clerkUserId || input.clerkUserId.trim() === "") {
    throw new Error("INVALID_AUTH_IDENTITY");
  }

  if (!input.email || input.email.trim() === "") {
    throw new Error("INVALID_AUTH_IDENTITY");
  }

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkUserId: input.clerkUserId },
    select: userPublicSelect,
  });
  if (existingByClerkId) {
    return existingByClerkId;
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
    },
  });
  if (!existingByEmail) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.user.update({
    where: { id: existingByEmail.id },
    data: {
      clerkUserId: input.clerkUserId,
    },
    select: userPublicSelect,
  });
};

export { syncAuthenticatedUser };
