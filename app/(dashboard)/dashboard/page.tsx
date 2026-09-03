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
import { WeeklyCalendar } from '@/components/dashboard/weekly-calendar';

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

  const calendarEntries = enrolled.map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.gradeLevel,
    dayOfWeek: c.dayOfWeek,
    startTimeUtc: c.startTimeUtc,
    durationMinutes: c.durationMinutes,
    teacherName: c.teacherName,
    hasMeeting: Boolean(c.zoomMeetingId),
  }));

  return (
    <>
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
    <section className="flex-1 px-4 lg:px-8 pb-10 max-w-5xl mx-auto w-full">
      <h2 className="am-heading text-lg font-bold mb-3" style={{ color: 'var(--am-navy)' }}>
        {isAdmin ? 'Full timetable' : 'Your week'}
      </h2>
      <WeeklyCalendar
        entries={calendarEntries}
        emptyMessage={isAdmin ? 'No classes exist yet.' : 'You are not enrolled in any classes yet.'}
      />
    </section>
    </>
  );
}
