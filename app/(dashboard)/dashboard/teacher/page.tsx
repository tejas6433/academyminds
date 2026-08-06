// app/(dashboard)/dashboard/teacher/page.tsx
import {
  getClassesForTeacher,
  getStudentsForClasses,
  getRecordingsForClasses,
} from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/guards';
import { TeacherClassCard } from '@/components/dashboard/teacher-class-card';
import { isZoomConfigured } from '@/lib/zoom';

export default async function TeacherDashboard() {
  const user = await requireRole(['teacher']);

  const myClasses = await getClassesForTeacher(user.id);

  // Two batched queries for ALL classes rather than two per class — a teacher
  // with 10 classes went from 21 round trips to 3.
  const classIds = myClasses.map((c) => c.id);
  const [studentsByClass, recordingsByClass] = await Promise.all([
    getStudentsForClasses(classIds),
    getRecordingsForClasses(classIds),
  ]);

  const enriched = myClasses.map((cls) => ({
    cls,
    students: studentsByClass.get(cls.id) ?? [],
    recordings: (recordingsByClass.get(cls.id) ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      playUrl: r.playUrl,
      status: r.status,
      durationMinutes: r.durationMinutes,
      recordedAt: r.recordedAt.toISOString(),
      published: r.published,
    })),
  }));

  const zoomReady = isZoomConfigured();

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Teacher</p>
        <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
          Dashboard
        </h1>
        <p className="text-[var(--am-ink-500)] text-sm mt-1.5">
          Manage your classes, launch live sessions, and publish recordings.
        </p>
      </div>

      {!zoomReady && (
        <div
          className="mb-6 rounded-2xl p-4 text-sm flex items-start gap-3"
          style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.35)', color: '#946c00' }}
        >
          <svg className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>
          <span>
            Zoom isn&apos;t configured yet — meetings use placeholder links. Add{' '}
            <code>ZOOM_ACCOUNT_ID</code>, <code>ZOOM_CLIENT_ID</code>, <code>ZOOM_CLIENT_SECRET</code> to enable real
            meetings &amp; cloud recording.
          </span>
        </div>
      )}

      {enriched.length === 0 ? (
        <div className="am-card p-12 text-center">
          <p className="text-[var(--am-ink-500)]">No classes assigned to you yet. An admin will assign your classes.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {enriched.map(({ cls, students, recordings }) => (
            <TeacherClassCard key={cls.id} cls={cls} students={students} recordings={recordings} />
          ))}
        </div>
      )}
    </section>
  );
}
