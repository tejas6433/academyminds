import { desc, and, eq, isNull, inArray } from 'drizzle-orm';
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

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

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

/** Students enrolled in a given class. */
export async function getStudentsForClass(classId: number) {
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(classEnrollments)
    .innerJoin(users, eq(classEnrollments.userId, users.id))
    .where(eq(classEnrollments.classId, classId));
  return rows;
}

/** Published recordings for the classes a student is enrolled in. */
export async function getRecordingsForStudent(userId: number) {
  const enrolled = await getClassesForStudent(userId);
  const classIds = enrolled.map((c) => c.id);
  if (classIds.length === 0) return [];
  return db
    .select()
    .from(recordings)
    .where(and(inArray(recordings.classId, classIds), eq(recordings.published, 1)))
    .orderBy(desc(recordings.recordedAt));
}

/** All recordings for a class (teacher/admin view, includes unpublished). */
export async function getRecordingsForClass(classId: number) {
  return db.select().from(recordings).where(eq(recordings.classId, classId)).orderBy(desc(recordings.recordedAt));
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
