// app/(dashboard)/dashboard/page.tsx
// Student schedule. Server-guarded: students (and admins) only. Fetches the
// student's real enrolled classes, next class, and recordings — no mock data.
import { requireRole } from '@/lib/auth/guards';
import { getClassesForStudent, getRecordingsForStudent } from '@/lib/db/queries';
import { nextClassInstance, todaysClasses } from '@/lib/schedule';
import { StudentDashboardView } from '@/components/dashboard/student-dashboard-view';

export default async function StudentDashboardPage() {
  const user = await requireRole(['student']);

  const [enrolled, recordings] = await Promise.all([
    getClassesForStudent(user.id),
    getRecordingsForStudent(user.id),
  ]);

  const next = nextClassInstance(enrolled);
  const today = todaysClasses(enrolled);

  const subjects = Array.from(new Set(enrolled.map((c) => c.subject)));

  return (
    <StudentDashboardView
      greetingName={user.name}
      next={next ? { ...next, startsAt: next.startsAt.toISOString() } : null}
      today={today.map((c) => ({ ...c, startsAt: c.startsAt.toISOString() }))}
      stats={{
        enrolled: enrolled.length,
        subjects: subjects.length,
        recordings: recordings.length,
      }}
    />
  );
}
