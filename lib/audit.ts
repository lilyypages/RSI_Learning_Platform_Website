import { db } from "@/lib/db";

interface AuditPayload {
  userId?: string;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  detail?: unknown;
}

export async function createAuditLog(payload: AuditPayload) {
  try {
    await db.auditLog.create({
      data: {
        userId: payload.userId,
        event: payload.event,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        detail: payload.detail,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}
