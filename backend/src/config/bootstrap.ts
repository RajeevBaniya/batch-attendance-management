import { Role } from "@prisma/client";

import prisma from "./db";
import { hashPassword } from "../utils/password";

const bootstrapSuperAdmin = async () => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const superAdminName = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  if (!superAdminEmail || !superAdminPassword) {
    return;
  }

  const existingSuperAdmin = await prisma.user.findUnique({
    where: {
      email: superAdminEmail,
    },
  });

  if (existingSuperAdmin) {
    return;
  }

  const passwordHash = await hashPassword(superAdminPassword);

  await prisma.user.create({
    data: {
      name: superAdminName,
      email: superAdminEmail,
      password: passwordHash,
      clerkUserId: `bootstrap-super-admin:${superAdminEmail}`,
      role: Role.SUPER_ADMIN,
    },
  });
};

export { bootstrapSuperAdmin };
