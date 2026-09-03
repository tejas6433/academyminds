import { desc, and, eq, isNull, inArray, or, gt } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  classes,
  classEnrollments,
  recordings,
  children,
  subscriptions,
  auditLogs,
  enquiries,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// ── AcademyMinds: classes, enrollments, recordings ──────────────────────────

/** All classes a teacher is assigned to teach. */
export async function getClassesForTeacher(teacherId: number) {
  return db.select().from(classes).where(eq(classes.teacherId, teacherId)).orderBy(classes.dayOfWeek);
}

/** All classes (admin view). */
export async function getAllClasses() {
  return db.select().from(classes).orderBy(desc(classes.createdAt));
}

export async function getClassById(classId: number) {
  const rows = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  return rows[0] ?? null;
}

/** Classes a student is enrolled in. */
export async function getClassesForStudent(userId: number) {
  const rows = await db
    .select({ cls: classes })
    .from(classEnrollments)
    .innerJoin(classes, eq(classEnrollments.classId, classes.id))
    .where(eq(classEnrollments.userId, userId));
  return rows.map((r) => r.cls);
}

/** Classes offered for a given grade level (catalog view). */
export async function getClassesByGrade(grade: number) {
  return db.select().from(classes).where(eq(classes.gradeLevel, grade)).orderBy(classes.dayOfWeek);
}

/** The children a parent registered at sign-up. */
export async function getChildrenForParent(parentId: number) {
  return db.select().from(children).where(eq(children.parentId, parentId)).orderBy(children.id);
}

const ACTIVE_STATUSES = ['active', 'trialing'];

/** Most recent subscription row for a user (by linked userId). */
export async function getSubscriptionForUser(userId: number) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}

/** True if the user currently has an active or trialing subscription. */
export async function isUserSubscribed(userId: number) {
  const sub = await getSubscriptionForUser(userId);
  return sub != null && ACTIVE_STATUSES.includes(sub.status);
}

/** Look up a subscription by payer email (used to link a paid-before-signup user). */
export async function getSubscriptionByEmail(email: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, email))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}

/** Published recordings for the classes a student is enrolled in. */
export async function getRecordingsForStudent(userId: number) {
  const enrolled = await getClassesForStudent(userId);
  const classIds = enrolled.map((c) => c.id);
  if (classIds.length === 0) return [];
  const now = new Date();
  return db
    .select()
    .from(recordings)
    .where(
      and(
        inArray(recordings.classId, classIds),
        eq(recordings.published, 1),
        // Hide anything already past its 30-day expiry (the retention cron may
        // not have physically purged it yet).
        or(isNull(recordings.expiresAt), gt(recordings.expiresAt, now))
      )
    )
    .orderBy(desc(recordings.recordedAt));
}

/** Every recording, newest first (admin view — not scoped to enrolment). */
export async function getAllRecordings(limit = 200) {
  return db.select().from(recordings).orderBy(desc(recordings.recordedAt)).limit(limit);
}

/** Recordings for the classes a given teacher owns. */
export async function getRecordingsForTeacher(teacherId: number) {
  const own = await db.select({ id: classes.id }).from(classes).where(eq(classes.teacherId, teacherId));
  const ids = own.map((c) => c.id);
  if (ids.length === 0) return [];
  return db
    .select()
    .from(recordings)
    .where(inArray(recordings.classId, ids))
    .orderBy(desc(recordings.recordedAt));
}

/** All enquiries, newest first (admin view). */
export async function getEnquiries(limit = 200) {
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(limit);
}

/** All subscriptions (paying customers), newest first (admin view). */
export async function getSubscriptions(limit = 200) {
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)).limit(limit);
}

export async function getRecordingById(recordingId: number) {
  const rows = await db.select().from(recordings).where(eq(recordings.id, recordingId)).limit(1);
  return rows[0] ?? null;
}

/**
 * Students for MANY classes in one query, grouped by class id.
 * Avoids running one query per class.
 */
export async function getStudentsForClasses(classIds: number[]) {
  const grouped = new Map<number, { id: number; name: string | null; email: string }[]>();
  if (classIds.length === 0) return grouped;

  const rows = await db
    .select({
      classId: classEnrollments.classId,
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(classEnrollments)
    .innerJoin(users, eq(classEnrollments.userId, users.id))
    .where(inArray(classEnrollments.classId, classIds));

  for (const r of rows) {
    const list = grouped.get(r.classId);
    const student = { id: r.id, name: r.name, email: r.email };
    if (list) list.push(student);
    else grouped.set(r.classId, [student]);
  }
  return grouped;
}

/**
 * Recordings for MANY classes in one query, grouped by class id.
 * Avoids running one query per class.
 */
export async function getRecordingsForClasses(classIds: number[]) {
  type Recording = typeof recordings.$inferSelect;
  const out = new Map<number, Recording[]>();
  if (classIds.length === 0) return out;

  const rows = await db
    .select()
    .from(recordings)
    .where(inArray(recordings.classId, classIds))
    .orderBy(desc(recordings.recordedAt));

  for (const r of rows) {
    const list = out.get(r.classId);
    if (list) list.push(r);
    else out.set(r.classId, [r]);
  }
  return out;
}

/** Recent audit-trail entries with the actor's name (admin view). */
export async function getAuditLogs(limit = 100) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      metadata: auditLogs.metadata,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getUsersByRole(role: string) {
  return db.select().from(users).where(and(eq(users.role, role), isNull(users.deletedAt)));
}

export async function getPlatformStats() {
  const [allUsers, allClasses, allRecordings] = await Promise.all([
    db.select({ id: users.id, role: users.role }).from(users).where(isNull(users.deletedAt)),
    db.select({ id: classes.id }).from(classes),
    db.select({ id: recordings.id }).from(recordings),
  ]);
  return {
    students: allUsers.filter((u) => u.role === 'student').length,
    teachers: allUsers.filter((u) => u.role === 'teacher').length,
    parents: allUsers.filter((u) => u.role === 'parent').length,
    totalUsers: allUsers.length,
    classes: allClasses.length,
    recordings: allRecordings.length,
  };
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}
