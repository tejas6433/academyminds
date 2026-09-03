// app/(dashboard)/dashboard/page.tsx
// Schedule view. Server-guarded: students (and admins) only.
// A student sees the classes they are enrolled in. An admin is not enrolled in
// anything, so showing the enrolment-scoped view gave them an empty page with a
// "Book a free trial" prompt — they see the full timetable instead.
import { requireRole } from '@/lib/auth/guards';
import {
  getClassesForStudent,
  getRecordingsForStudent,
  getAllClasses,
  getAllRecordings,
} from '@/lib/db/queries';
import { nextClassInstance, todaysClasses } from '@/lib/schedule';
import { StudentDashboardView } from '@/components/dashboard/student-dashboard-view';

export default async function StudentDashboardPage() {
  const user = await requireRole(['student']);

  const isAdmin = user.role === 'admin';
  const [enrolled, recordings] = await Promise.all([
    isAdmin ? getAllClasses() : getClassesForStudent(user.id),
    isAdmin ? getAllRecordings() : getRecordingsForStudent(user.id),
  ]);

  const next = nextClassInstance(enrolled);
  const today = todaysClasses(enrolled);

  const subjects = Array.from(new Set(enrolled.map((c) => c.subject)));

  return (
    <StudentDashboardView
      greetingName={user.name}
      isAdmin={isAdmin}
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
