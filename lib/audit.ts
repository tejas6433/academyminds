// lib/audit.ts
// One helper to append an audit-trail entry. Call it AFTER a sensitive mutation
// succeeds. Logging must never break the real action, so it swallows its errors.
import { headers } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { auditLogs } from '@/lib/db/schema';

interface AuditInput {
  actorId?: number | null; // who performed it (null = system/webhook)
  action: string; // stable verb, e.g. 'role.change', 'class.create'
  targetType?: string; // 'user' | 'class' | 'subscription' | ...
  targetId?: string | number;
  metadata?: Record<string, unknown>; // before/after, extra context
}

export async function logAudit(input: AuditInput): Promise<void> {
  let ip: string | null = null;
  try {
    const h = await headers();
    ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null;
  } catch {
    // headers() is only available in a request scope; ignore otherwise.
  }

  try {
    await db.insert(auditLogs).values({
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId != null ? String(input.targetId) : null,
      metadata: input.metadata ?? null,
      ipAddress: ip,
    });
  } catch (err) {
    console.error('[audit] failed to record', input.action, err);
  }
}
