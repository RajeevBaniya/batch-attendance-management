import { Role, User } from "@prisma/client";

import prisma from "../../config/db";

const listAnalyticsInstitutions = async (currentUser: User) => {
  if (currentUser.role !== Role.PROGRAMME_MANAGER && currentUser.role !== Role.MONITORING_OFFICER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

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

export { listAnalyticsInstitutions };
