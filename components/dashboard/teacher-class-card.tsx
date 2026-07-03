'use client';

import { useState, useTransition } from 'react';
import { createMeetingForClass, setRecordingPublished } from '@/lib/actions/classes';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RecordingLite {
  id: number;
  title: string;
  playUrl: string;
  durationMinutes: number;
  recordedAt: string;
  published: number;
}

interface TeacherClassCardProps {
  cls: {
    id: number;
    name: string;
    subject: 'math' | 'coding' | string;
    gradeLevel: number;
    dayOfWeek: number;
    startTimeUtc: string;
    durationMinutes: number;
    joinUrl: string | null;
    zoomMeetingId: string | null;
    zoomStartUrl: string | null;
  };
  students: { id: number; name: string | null; email: string }[];
  recordings: RecordingLite[];
}

export function TeacherClassCard({ cls, students, recordings }: TeacherClassCardProps) {
  const [pending, startTransition] = useTransition();
  const [startUrl, setStartUrl] = useState<string | null>(cls.zoomStartUrl);
  const [hasMeeting, setHasMeeting] = useState(Boolean(cls.zoomMeetingId));
  const [error, setError] = useState('');
  const [recs, setRecs] = useState(recordings);

  function handleCreate() {
    setError('');
    startTransition(async () => {
      try {
        const res = await createMeetingForClass(cls.id);
        setStartUrl(res.startUrl);
        setHasMeeting(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create meeting');
      }
    });
  }

  function togglePublish(rec: RecordingLite) {
    startTransition(async () => {
      await setRecordingPublished(rec.id, rec.published !== 1);
      setRecs((prev) => prev.map((r) => (r.id === rec.id ? { ...r, published: r.published === 1 ? 0 : 1 } : r)));
    });
  }

  return (
    <div className="am-card p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold flex-shrink-0"
            style={cls.subject === 'math'
              ? { background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }
              : { background: 'rgba(26,26,46,0.07)', color: 'var(--am-navy)' }}
            aria-hidden
          >
            {cls.subject === 'math' ? 'Σ' : '{}'}
          </span>
          <div>
            <h3 className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--am-navy)' }}>{cls.name}</h3>
            <p className="text-[var(--am-ink-500)] text-sm mt-0.5">
              Grade {cls.gradeLevel} · {DAY_NAMES[cls.dayOfWeek]} {cls.startTimeUtc.slice(0, 5)} UTC · {cls.durationMinutes} min
            </p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
          style={
            hasMeeting
              ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a' }
              : { background: 'rgba(107,114,128,0.1)', color: '#6b7280' }
          }
        >
          {hasMeeting && <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#16a34a' }} />}
          {hasMeeting ? 'Meeting ready' : 'No meeting yet'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {!hasMeeting ? (
          <button
            onClick={handleCreate}
            disabled={pending}
            className="am-btn am-btn-primary px-5 text-sm disabled:opacity-60"
          >
            {pending ? 'Creating…' : (
              <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Create Zoom Meeting</>
            )}
          </button>
        ) : (
          <>
            {startUrl && (
              <a
                href={startUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="am-btn am-btn-gold px-5 text-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>
                Start Class
              </a>
            )}
            <button
              onClick={handleCreate}
              disabled={pending}
              className="am-btn px-5 text-sm disabled:opacity-60"
              style={{ border: '1.5px solid var(--am-purple)', color: 'var(--am-purple)', background: 'white' }}
            >
              {pending ? 'Working…' : 'Recreate'}
            </button>
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <hr className="am-rule mb-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h4 className="am-eyebrow text-[var(--am-ink-400)] mb-3">
            Students ({students.length})
          </h4>
          {students.length === 0 ? (
            <p className="text-[var(--am-ink-400)] text-sm">No students enrolled yet.</p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5 text-sm text-[var(--am-ink-700)]">
                  <span
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: 'var(--am-gradient)' }}
                  >
                    {(s.name ?? s.email)[0].toUpperCase()}
                  </span>
                  {s.name ?? s.email}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="am-eyebrow text-[var(--am-ink-400)] mb-3">
            Recordings ({recs.length})
          </h4>
          {recs.length === 0 ? (
            <p className="text-[var(--am-ink-400)] text-sm">Recordings auto-post here after class.</p>
          ) : (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                  <a href={r.playUrl} target="_blank" rel="noopener noreferrer" className="underline truncate" style={{ color: 'var(--am-purple)' }}>
                    {r.title}
                  </a>
                  <button
                    onClick={() => togglePublish(r)}
                    disabled={pending}
                    className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap disabled:opacity-60"
                    style={
                      r.published === 1
                        ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                        : { background: 'rgba(107,114,128,0.12)', color: '#6b7280' }
                    }
                  >
                    {r.published === 1 ? 'Published' : 'Hidden'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
