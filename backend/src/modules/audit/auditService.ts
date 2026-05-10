import prisma from "../../config/db";

import type { AuditEventInput } from "./auditTypes";
import type { PaginationParams } from "../../utils/pagination";


const recordAuditEvent = async (input: AuditEventInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorRole: input.actorRole,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("audit_log_write_failed", error);
  }
};

const listAuditLogs = async (pagination: PaginationParams) => {
  const [totalItems, items] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      select: {
        id: true,
        actorId: true,
        actorRole: true,
        eventType: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
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

export { listAuditLogs, recordAuditEvent };
