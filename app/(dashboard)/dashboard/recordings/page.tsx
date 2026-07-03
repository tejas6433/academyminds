// app/(dashboard)/dashboard/recordings/page.tsx
import { redirect } from 'next/navigation';
import { getUser, getRecordingsForStudent } from '@/lib/db/queries';

export default async function RecordingsPage() {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  const recordings = await getRecordingsForStudent(user.id);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Recordings</p>
        <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
          Class Recordings
        </h1>
        <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Catch up on any class you missed — recordings post automatically.</p>
      </div>

      {recordings.length === 0 ? (
        <div className="am-card p-10 text-center">
          <p className="text-[var(--am-ink-500)]">No recordings yet. They&apos;ll appear here after your classes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((r) => (
            <a
              key={r.id}
              href={r.playUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="am-card am-card-hover flex items-center justify-between gap-4 p-5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }}
                  aria-hidden
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <div className="min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--am-navy)' }}>{r.title}</p>
                  <p className="text-[var(--am-ink-400)] text-xs mt-0.5">
                    {new Date(r.recordedAt).toLocaleDateString()} · {r.durationMinutes} min
                    {r.passcode ? ` · passcode: ${r.passcode}` : ''}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--am-purple)' }}>Watch →</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
