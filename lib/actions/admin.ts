'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  children,
  classEnrollments,
  passwordResetTokens,
  subscriptions,
  classes,
  auditLogs,
  teamMembers,
  activityLogs,
} from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { logAudit } from '@/lib/audit';

/**
 * PIPEDA "right to erasure": permanently delete a user and everything tied to
 * them. Runs in a single transaction — if any step fails, the whole thing rolls
 * back and the account is left intact (no half-deleted, broken state).
 *
 * Foreign keys dictate the order: rows that POINT AT the user must be removed
 * or unlinked before the user row itself can go.
 */
export async function deleteUser(userId: number) {
  const admin = await getUser();
  if (!admin || admin.role !== 'admin') throw new Error('Forbidden');
  if (admin.id === userId) throw new Error('You cannot delete your own account here.');

  await db.transaction(async (tx) => {
    // 1) Hard-delete rows owned by this user.
    await tx.delete(classEnrollments).where(eq(classEnrollments.userId, userId));
    await tx.delete(children).where(eq(children.parentId, userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await tx.delete(teamMembers).where(eq(teamMembers.userId, userId));

    // 2) Unlink references we want to KEEP (billing history, class assignments,
    //    the audit trail) so they survive without pointing at a deleted row.
    await tx.update(subscriptions).set({ userId: null }).where(eq(subscriptions.userId, userId));
    await tx.update(classes).set({ teacherId: null }).where(eq(classes.teacherId, userId));
    await tx.update(auditLogs).set({ actorId: null }).where(eq(auditLogs.actorId, userId));
    await tx.update(activityLogs).set({ userId: null }).where(eq(activityLogs.userId, userId));

    // 3) Finally the user row itself.
    await tx.delete(users).where(eq(users.id, userId));
  });

  await logAudit({ actorId: admin.id, action: 'user.delete', targetType: 'user', targetId: userId });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
