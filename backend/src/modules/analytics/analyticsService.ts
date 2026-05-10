import { Role, type User } from "@prisma/client";

import prisma from "../../config/db";

import type { PaginationParams } from "../../utils/pagination";

const listAnalyticsInstitutions = async (currentUser: User, pagination: PaginationParams) => {
  if (currentUser.role !== Role.PROGRAMME_MANAGER && currentUser.role !== Role.MONITORING_OFFICER) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  const [totalItems, items] = await prisma.$transaction([
    prisma.institution.count(),
    prisma.institution.findMany({
      select: {
        id: true,
        name: true,
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

export { listAnalyticsInstitutions };
