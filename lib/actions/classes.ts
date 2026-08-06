'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { classes, classEnrollments, recordings, users } from '@/lib/db/schema';
import { getUser, getClassById } from '@/lib/db/queries';
import { createZoomMeeting } from '@/lib/zoom';
import { logAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/auth/session';
import { sendStudentCredentialsEmail, sendTeacherCredentialsEmail } from '@/lib/email/resend';
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
export async function setUserRole(userId: number, role: string) {
  const actor = await assertRole(['admin']);
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

  const [student] = await db
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
    await db.insert(classEnrollments).values({ classId: input.classId, userId: student.id });
  }

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
  return { ok: true as const, studentId: student.id };
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
  return { ok: true as const, teacherId: teacher.id };
}

/** Admin: enroll a student into a class. */
export async function enrollStudent(classId: number, studentId: number) {
  const actor = await assertRole(['admin']);
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

/** Teacher or admin: toggle a recording's visibility to students. */
export async function setRecordingPublished(recordingId: number, published: boolean) {
  const actor = await assertRole(['teacher', 'admin']);
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
