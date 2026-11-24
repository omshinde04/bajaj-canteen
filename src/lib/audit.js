import AuditLog from "@/models/AuditLog";
import { connectDB } from "@/lib/db";

/**
 * Enterprise Audit Trail Recorder
 * Automatically logs immutable audit events with IP, UserAgent, and mutation diffs
 */
export async function recordAuditLog({
  actorId = null,
  actor = null,
  actorName = "System",
  action,
  module,
  recordId = null,
  targetId = null,
  previousValue = null,
  updatedValue = null,
  req = null,
  metadata = {},
}) {
  try {
    await connectDB();

    const actualActorId = actorId || actor;
    const actualRecordId = recordId || targetId;

    let ipAddress = "unknown";
    let userAgent = "unknown";

    if (req) {
      ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";
      userAgent = req.headers.get("user-agent") || "unknown";
    }

    const log = await AuditLog.create({
      actorId: actualActorId,
      actorName,
      action,
      module,
      recordId: actualRecordId ? String(actualRecordId) : null,
      previousValue,
      updatedValue,
      ipAddress,
      userAgent,
      metadata,
    });

    return log;
  } catch (error) {
    // Non-blocking catch to ensure core operations succeed even if logging fails
    console.error("Audit Trail Recording Error:", error.message);
    return null;
  }
}
