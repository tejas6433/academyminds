// app/(dashboard)/dashboard/recordings/page.tsx
import { redirect } from 'next/navigation';
import {
  getUser,
  getRecordingsForStudent,
  getAllRecordings,
  getRecordingsForTeacher,
} from '@/lib/db/queries';

export default async function RecordingsPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  // Scope by role. The student view is enrolment-filtered, which meant admins
  // and teachers — who are not enrolled in anything — saw an empty page even
  // when recordings existed.
  const recordings =
    user.role === 'admin'
      ? await getAllRecordings()
      : user.role === 'teacher'
        ? await getRecordingsForTeacher(user.id)
        : await getRecordingsForStudent(user.id);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Recordings</p>
        <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
          Class Recordings
        </h1>
        <p className="text-[var(--am-ink-500)] text-sm mt-1.5">
            {user.role === 'admin'
              ? 'All recordings across every class.'
              : user.role === 'teacher'
                ? 'Recordings from the classes you teach.'
                : 'Catch up on any class you missed — recordings post automatically.'}
          </p>
      </div>

      {recordings.length === 0 ? (
        <div className="am-card p-10 text-center">
          <p className="text-[var(--am-ink-500)]">
            {user.role === 'student'
              ? 'No recordings yet. They\u2019ll appear here after your classes.'
              : 'No recordings yet. They\u2019ll appear here automatically after a recorded class.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((r) => {
            // A recording is watchable once its MP4 has been copied to our
            // storage (status='ready'). Legacy rows use the old Zoom link.
            const ready = r.status === 'ready' || Boolean(r.playUrl);
            const processing = r.status === 'pending' || r.status === 'transferring';
            const daysLeft = r.expiresAt
              ? Math.max(0, Math.ceil((new Date(r.expiresAt).getTime() - Date.now()) / 86_400_000))
              : null;
            // Ready recordings play through the auth-gated route; never link the
            // raw storage/Zoom URL directly.
            const href = r.status === 'ready' ? `/api/recordings/${r.id}/play` : r.playUrl ?? undefined;

            const meta = (
              <p className="text-[var(--am-ink-400)] text-xs mt-0.5">
                {new Date(r.recordedAt).toLocaleDateString()} · {r.durationMinutes} min
                {daysLeft !== null ? ` · available ${daysLeft} more day${daysLeft === 1 ? '' : 's'}` : ''}
              </p>
            );

            const icon = (
              <span
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }}
                aria-hidden
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            );

            if (ready && href) {
              return (
                <a
                  key={r.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-card am-card-hover flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {icon}
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--am-navy)' }}>{r.title}</p>
                      {meta}
                    </div>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--am-purple)' }}>Watch →</span>
                </a>
              );
            }

            return (
              <div key={r.id} className="am-card flex items-center justify-between gap-4 p-5 opacity-70">
                <div className="flex items-center gap-3 min-w-0">
                  {icon}
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--am-navy)' }}>{r.title}</p>
                    {meta}
                  </div>
                </div>
                <span className="text-xs font-semibold whitespace-nowrap text-[var(--am-ink-400)]">
                  {processing ? 'Processing…' : 'Unavailable'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
