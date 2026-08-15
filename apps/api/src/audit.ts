import { db } from "./db/client.js";
import { auditEvents } from "./db/schema.js";

export const recordAuditEvent = async (event: {
  organizationId?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) => {
  await db.insert(auditEvents).values(event);
};
