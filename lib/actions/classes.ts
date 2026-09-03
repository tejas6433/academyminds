'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { classes, classEnrollments, recordings, users } from '@/lib/db/schema';
import { getUser, getClassById } from '@/lib/db/queries';
import { createZoomMeeting } from '@/lib/zoom';
import { logAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/auth/session';
import { sendStudentCredentialsEmail, sendTeacherCredentialsEmail } from '@/lib/email/resend';
import { deleteFromR2 } from '@/lib/r2';
import { randomBytes } from 'crypto';

const DAY_TO_ZOOM: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 };

function nextDateForDay(dayOfWeek: number, startTimeUtc: string): string {
  const [h, m, s] = startTimeUtc.split(':').map((n) => parseInt(n, 10));
  const now = new Date();
  const result = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h || 0, m || 0, s || 0));
  let delta = (dayOfWeek - result.getUTCDay() + 7) % 7;
  if (delta === 0 && result.getTime() < now.getTime()) delta = 7;
  result.setUTCDate(result.getUTCDate() + delta);
  return result.toISOString();
}

async function assertRole(roles: string[]) {
  const user = await getUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

/** Teacher or admin: create the Zoom meeting for a class (cloud recording on). */
export async function createMeetingForClass(classId: number) {
  const user = await assertRole(['teacher', 'admin']);
  const cls = await getClassById(classId);
  if (!cls) throw new Error('Class not found');
  if (user.role === 'teacher' && cls.teacherId !== user.id) {
    throw new Error('Not your class');
  }

  const meeting = await createZoomMeeting({
    topic: `AcademyMinds — ${cls.name} (Grade ${cls.gradeLevel})`,
    startTimeIso: nextDateForDay(cls.dayOfWeek, cls.startTimeUtc),
    durationMinutes: cls.durationMinutes,
    recurringWeeklyDays: [DAY_TO_ZOOM[cls.dayOfWeek]],
    agenda: `${cls.subject === 'math' ? 'Math' : 'Coding'} live class with ${cls.teacherName}.`,
  });

  await db
    .update(classes)
    .set({ zoomMeetingId: meeting.meetingId, joinUrl: meeting.joinUrl, zoomStartUrl: meeting.startUrl })
    .where(eq(classes.id, classId));

  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/admin');
  return { ok: true, joinUrl: meeting.joinUrl, startUrl: meeting.startUrl };
}

/** Admin: create a class. */
export async function createClass(input: {
  name: string;
  subject: 'math' | 'coding';
  gradeLevel: number;
  teacherId: number | null;
  teacherName: string;
  teacherTitle?: string;
  dayOfWeek: number;
  startTimeUtc: string;
  durationMinutes: number;
}) {
  const actor = await assertRole(['admin']);
  const [created] = await db.insert(classes).values({
    name: input.name,
    subject: input.subject,
    gradeLevel: input.gradeLevel,
    teacherId: input.teacherId,
    teacherName: input.teacherName,
    teacherTitle: input.teacherTitle,
    dayOfWeek: input.dayOfWeek,
    startTimeUtc: input.startTimeUtc,
    durationMinutes: input.durationMinutes,
  }).returning();
  await logAudit({
    actorId: actor.id,
    action: 'class.create',
    targetType: 'class',
    targetId: created.id,
    metadata: { name: input.name, gradeLevel: input.gradeLevel, teacherId: input.teacherId },
  });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Admin: assign / reassign a teacher to a class. */
export async function assignTeacher(classId: number, teacherId: number, teacherName: string) {
  const actor = await assertRole(['admin']);
  await db.update(classes).set({ teacherId, teacherName }).where(eq(classes.id, classId));
  await logAudit({
    actorId: actor.id,
    action: 'class.assign_teacher',
    targetType: 'class',
    targetId: classId,
    metadata: { teacherId, teacherName },
  });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Admin: change a user's platform role. */
const ASSIGNABLE_ROLES = ['admin', 'teacher', 'parent', 'student'] as const;

export async function setUserRole(userId: number, role: string) {
  const actor = await assertRole(['admin']);

  // Only known roles may be assigned — an arbitrary string would silently create
  // a user who matches no guard and can reach nothing.
  if (!ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) {
    throw new Error('Invalid role');
  }
  // An admin demoting themselves would be locked out of the admin area with no
  // way back in (deleteUser guards self-deletion for the same reason).
  if (actor.id === userId && role !== 'admin') {
    throw new Error('You cannot change your own admin role.');
  }

  const [before] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await logAudit({
    actorId: actor.id,
    action: 'role.change',
    targetType: 'user',
    targetId: userId,
    metadata: { from: before?.role ?? null, to: role },
  });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/**
 * Admin: create a student login for a parent's child, optionally enroll them in
 * a class, and email the credentials to the parent. This is the PIPEDA-safe path
 * — the parent has already consented at signup/payment, and every kid account is
 * created by an admin, never self-served.
 */
export async function createStudentAccount(input: {
  studentName: string;
  studentEmail: string;
  parentEmail: string;
  classId?: number;
}) {
  const actor = await assertRole(['admin']);
  const studentName = input.studentName.trim();
  const studentEmail = input.studentEmail.trim().toLowerCase();
  const parentEmail = input.parentEmail.trim().toLowerCase();

  if (!studentName || !studentEmail || !parentEmail) {
    return { ok: false as const, error: 'Student name, student email, and parent email are all required.' };
  }

  // Reject if the email is already taken.
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, studentEmail)).limit(1);
  if (existing[0]) {
    return { ok: false as const, error: 'A user with that student email already exists.' };
  }

  // Generate a temporary password the parent can change later.
  const tempPassword = randomBytes(9).toString('base64url'); // ~12 chars, URL-safe
  const passwordHash = await hashPassword(tempPassword);

  // Account + enrolment commit together, so a failed enrolment can't leave a
  // student account stranded outside the class it was created for.
  const student = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(users)
      .values({
        name: studentName,
        email: studentEmail,
        passwordHash,
        role: 'student',
        // Parent already consented at signup/payment; recording it on the child
        // account keeps the PIPEDA trail complete.
        parentalConsentAt: new Date(),
      })
      .returning({ id: users.id });

    if (input.classId) {
      await tx.insert(classEnrollments).values({ classId: input.classId, userId: created.id });
    }
    return created;
  });

  await logAudit({
    actorId: actor.id,
    action: 'student.create',
    targetType: 'user',
    targetId: student.id,
    metadata: { parentEmail, classId: input.classId ?? null },
  });

  // Email the login to the parent (never fails the action if email is down).
  await sendStudentCredentialsEmail(parentEmail, {
    studentName,
    studentEmail,
    tempPassword,
  });

  revalidatePath('/dashboard/admin/customers');
  // Return the temp password so the admin can share it manually if the email
  // doesn't deliver (e.g. before the sending domain is verified).
  return { ok: true as const, studentId: student.id, tempPassword };
}

/**
 * Admin: create a teacher login and email the credentials to the teacher.
 * Saves the "sign up then get promoted" dance — the teacher can sign in directly.
 */
export async function createTeacherAccount(input: { name: string; email: string }) {
  const actor = await assertRole(['admin']);
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name || !email) {
    return { ok: false as const, error: 'Name and email are both required.' };
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    return { ok: false as const, error: 'A user with that email already exists.' };
  }

  const tempPassword = randomBytes(9).toString('base64url');
  const passwordHash = await hashPassword(tempPassword);

  const [teacher] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: 'teacher' })
    .returning({ id: users.id });

  await logAudit({
    actorId: actor.id,
    action: 'teacher.create',
    targetType: 'user',
    targetId: teacher.id,
  });

  await sendTeacherCredentialsEmail(email, { name, email, tempPassword });

  revalidatePath('/dashboard/admin');
  return { ok: true as const, teacherId: teacher.id, tempPassword };
}

/** Admin: enroll a student into a class. */
export async function enrollStudent(classId: number, studentId: number) {
  const actor = await assertRole(['admin']);

  // Guard against enrolling the same student twice — there is no unique
  // constraint on (class_id, user_id), so a repeated click would otherwise
  // create duplicate rows and show the student twice on the roster.
  const existing = await db
    .select({ id: classEnrollments.id })
    .from(classEnrollments)
    .where(and(eq(classEnrollments.classId, classId), eq(classEnrollments.userId, studentId)))
    .limit(1);
  if (existing[0]) {
    return { ok: true as const, alreadyEnrolled: true as const };
  }

  await db.insert(classEnrollments).values({ classId, userId: studentId });
  await logAudit({
    actorId: actor.id,
    action: 'enrollment.create',
    targetType: 'class',
    targetId: classId,
    metadata: { studentId },
  });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/**
 * Admin: permanently delete a class. Cleans up everything that references it
 * first — enrollments, and recordings (including their stored R2 files) — so
 * nothing is orphaned. Destructive and irreversible.
 */
export async function deleteClass(classId: number) {
  const actor = await assertRole(['admin']);
  const cls = await getClassById(classId);
  if (!cls) return { ok: false as const, error: 'Class not found.' };

  // Collect stored-file keys before the rows go away.
  const recs = await db
    .select({ id: recordings.id, r2Key: recordings.r2Key })
    .from(recordings)
    .where(eq(recordings.classId, classId));

  // All row deletions commit together — a failure part-way leaves the class
  // fully intact rather than half-deleted with orphaned enrollments.
  await db.transaction(async (tx) => {
    await tx.delete(recordings).where(eq(recordings.classId, classId));
    await tx.delete(classEnrollments).where(eq(classEnrollments.classId, classId));
    await tx.delete(classes).where(eq(classes.id, classId));
  });

  // Storage cleanup runs only after the DB commit — external calls can't take
  // part in the transaction, and deleting files for a rollback we then undid
  // would destroy videos we still had rows for. Orphaned objects are logged.
  for (const r of recs) {
    if (!r.r2Key) continue;
    try {
      await deleteFromR2(r.r2Key);
    } catch (err) {
      console.error(`[deleteClass] R2 delete failed for recording ${r.id} (${r.r2Key}):`, err);
    }
  }

  await logAudit({
    actorId: actor.id,
    action: 'class.delete',
    targetType: 'class',
    targetId: classId,
    metadata: { name: cls.name },
  });
  revalidatePath('/dashboard/admin');
  return { ok: true as const };
}

/**
 * Admin: permanently delete a single recording — the stored video and the row.
 * Hiding a recording only removes it from view; this is the path for a genuine
 * privacy incident where the file itself must not continue to exist.
 *
 * The stored object is removed first and a failure is surfaced rather than
 * swallowed: if we cannot prove the video is gone, the row stays so the delete
 * can be retried (and the retention sweep will try again later).
 */
export async function deleteRecording(recordingId: number) {
  const actor = await assertRole(['admin']);

  const [rec] = await db
    .select({ id: recordings.id, r2Key: recordings.r2Key, title: recordings.title })
    .from(recordings)
    .where(eq(recordings.id, recordingId))
    .limit(1);
  if (!rec) return { ok: false as const, error: 'Recording not found.' };

  if (rec.r2Key) {
    try {
      await deleteFromR2(rec.r2Key);
    } catch (err) {
      console.error(`[deleteRecording] storage delete failed for ${rec.r2Key}:`, err);
      return {
        ok: false as const,
        error: 'Could not delete the stored video. The recording was left in place — try again.',
      };
    }
  }

  await db.delete(recordings).where(eq(recordings.id, recordingId));

  await logAudit({
    actorId: actor.id,
    action: 'recording.delete',
    targetType: 'recording',
    targetId: recordingId,
    metadata: { title: rec.title, r2Key: rec.r2Key ?? null },
  });

  revalidatePath('/dashboard/recordings');
  revalidatePath('/dashboard/teacher');
  return { ok: true as const };
}

/** Teacher or admin: toggle a recording's visibility to students. */
export async function setRecordingPublished(recordingId: number, published: boolean) {
  const actor = await assertRole(['teacher', 'admin']);

  // IDOR guard: a teacher may only touch recordings belonging to a class they
  // teach. Without this, any teacher could publish or hide another teacher's
  // recordings by passing an arbitrary id.
  const [rec] = await db
    .select({ classId: recordings.classId })
    .from(recordings)
    .where(eq(recordings.id, recordingId))
    .limit(1);
  if (!rec) throw new Error('Recording not found');
  if (actor.role === 'teacher') {
    const cls = await getClassById(rec.classId);
    if (!cls || cls.teacherId !== actor.id) {
      throw new Error('Not your class');
    }
  }

  await db.update(recordings).set({ published: published ? 1 : 0 }).where(eq(recordings.id, recordingId));
  await logAudit({
    actorId: actor.id,
    action: published ? 'recording.publish' : 'recording.hide',
    targetType: 'recording',
    targetId: recordingId,
  });
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
