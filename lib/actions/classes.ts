'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { classes, classEnrollments, recordings, users } from '@/lib/db/schema';
import { getUser, getClassById } from '@/lib/db/queries';
import { createZoomMeeting } from '@/lib/zoom';

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
  await assertRole(['admin']);
  await db.insert(classes).values({
    name: input.name,
    subject: input.subject,
    gradeLevel: input.gradeLevel,
    teacherId: input.teacherId,
    teacherName: input.teacherName,
    teacherTitle: input.teacherTitle,
    dayOfWeek: input.dayOfWeek,
    startTimeUtc: input.startTimeUtc,
    durationMinutes: input.durationMinutes,
  });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Admin: assign / reassign a teacher to a class. */
export async function assignTeacher(classId: number, teacherId: number, teacherName: string) {
  await assertRole(['admin']);
  await db.update(classes).set({ teacherId, teacherName }).where(eq(classes.id, classId));
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Admin: change a user's platform role. */
export async function setUserRole(userId: number, role: string) {
  await assertRole(['admin']);
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Admin: enroll a student into a class. */
export async function enrollStudent(classId: number, studentId: number) {
  await assertRole(['admin']);
  await db.insert(classEnrollments).values({ classId, userId: studentId });
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** Teacher or admin: toggle a recording's visibility to students. */
export async function setRecordingPublished(recordingId: number, published: boolean) {
  await assertRole(['teacher', 'admin']);
  await db.update(recordings).set({ published: published ? 1 : 0 }).where(eq(recordings.id, recordingId));
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
