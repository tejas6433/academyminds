// app/api/admin/users/[id]/export/route.ts
// PIPEDA "right to access": download everything we hold about a user as JSON.
// Admin-only. Password hash is deliberately excluded.
import { NextRequest, NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { users, children, classEnrollments, subscriptions, auditLogs } from '@/lib/db/schema';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = Number((await params).id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [kids, enrolments, subs, actions] = await Promise.all([
    db.select().from(children).where(eq(children.parentId, userId)),
    db.select().from(classEnrollments).where(eq(classEnrollments.userId, userId)),
    db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select().from(auditLogs).where(or(eq(auditLogs.actorId, userId))),
  ]);

  // Never export the password hash.
  const { passwordHash, ...safeUser } = user;

  const payload = {
    exportedAt: new Date().toISOString(),
    user: safeUser,
    children: kids,
    enrolments,
    subscriptions: subs,
    auditActions: actions,
  };

  await logAudit({ actorId: admin.id, action: 'user.export', targetType: 'user', targetId: userId });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="academyminds-user-${userId}.json"`,
    },
  });
}
