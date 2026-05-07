import prisma from "../../config/db";

const listPublicInstitutions = async () => {
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

export { listPublicInstitutions };
