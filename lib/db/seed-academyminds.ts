// lib/db/seed-academyminds.ts
// Seeds a clickable demo: admin, teacher, parent, two students, one class,
// enrollments, and a sample published recording. Idempotent on email.
import { db } from './drizzle';
import { users, classes, classEnrollments, recordings, children } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

const PASSWORD = 'password123';

async function upsertUser(email: string, name: string, role: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    await db.update(users).set({ role, name }).where(eq(users.id, existing[0].id));
    return existing[0].id;
  }
  const passwordHash = await hashPassword(PASSWORD);
  const [u] = await db.insert(users).values({ email, name, role, passwordHash }).returning();
  return u.id;
}

async function seed() {
  console.log('Seeding AcademyMinds demo data...');

  const adminId = await upsertUser('admin@academyminds.com', 'Admin User', 'admin');
  const teacherId = await upsertUser('teacher@academyminds.com', 'Rajan Sharma', 'teacher');
  const parentId = await upsertUser('parent@academyminds.com', 'Parent User', 'parent');
  const student1 = await upsertUser('aanya@academyminds.com', 'Aanya', 'student');
  const student2 = await upsertUser('kabir@academyminds.com', 'Kabir', 'student');

  // Create a class assigned to the teacher (skip if one already exists with same name).
  const existingClass = await db.select().from(classes).where(eq(classes.name, 'Algebra — Chapter 3')).limit(1);
  let classId: number;
  if (existingClass[0]) {
    classId = existingClass[0].id;
    await db.update(classes).set({ teacherId, teacherName: 'Rajan Sharma' }).where(eq(classes.id, classId));
  } else {
    const [c] = await db
      .insert(classes)
      .values({
        name: 'Algebra — Chapter 3',
        subject: 'math',
        gradeLevel: 6,
        teacherId,
        teacherName: 'Rajan Sharma',
        teacherTitle: 'B.Ed, CBSE Math Specialist',
        dayOfWeek: 1, // Monday
        startTimeUtc: '16:00:00',
        durationMinutes: 60,
        rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      })
      .returning();
    classId = c.id;
  }

  // Enroll both students (avoid duplicates).
  for (const sid of [student1, student2]) {
    const enrolled = await db
      .select()
      .from(classEnrollments)
      .where(eq(classEnrollments.userId, sid));
    if (!enrolled.some((e) => e.classId === classId)) {
      await db.insert(classEnrollments).values({ classId, userId: sid });
    }
  }

  // A child on the parent's account (Grade 6 → sees the seeded class).
  const existingChild = await db.select().from(children).where(eq(children.parentId, parentId)).limit(1);
  if (!existingChild[0]) {
    await db.insert(children).values({ parentId, name: 'Meera', gradeLevel: 6, subjectInterest: 'both' });
  }

  // Sample published recording so the recordings page has content.
  const existingRec = await db.select().from(recordings).where(eq(recordings.classId, classId)).limit(1);
  if (!existingRec[0]) {
    await db.insert(recordings).values({
      classId,
      title: 'Algebra — Chapter 3 — Demo Recording',
      playUrl: 'https://zoom.us/rec/share/demo-playback-url',
      durationMinutes: 58,
      passcode: 'Demo123',
      published: 1,
    });
  }

  console.log('\n✅ Demo data ready. Log in with password: ' + PASSWORD);
  console.log('   admin@academyminds.com    → /dashboard/admin');
  console.log('   teacher@academyminds.com  → /dashboard/teacher');
  console.log('   parent@academyminds.com   → /dashboard/parent');
  console.log('   aanya@academyminds.com    → /dashboard (student)');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
