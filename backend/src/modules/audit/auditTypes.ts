import { type Role } from "@prisma/client";

type AuditEventType =
  | "institution.created"
  | "trainer.request.created"
  | "trainer.request.approved"
  | "batch.created"
  | "trainer.assigned"
  | "invite.generated"
  | "student.joined.batch"
  | "session.created"
  | "attendance.marked"
  | "report.exported";

type AuditEntityType =
  | "institution"
  | "trainer_request"
  | "batch"
  | "invite"
  | "session"
  | "attendance"
  | "report";

type AuditMetadata = Record<string, string | number | boolean | null>;

type AuditEventInput = {
  actorId?: string;
  actorRole?: Role;
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: AuditMetadata;
};

export type { AuditEntityType, AuditEventInput, AuditEventType, AuditMetadata };
