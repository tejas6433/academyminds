'use client';

import { useMemo } from 'react';

export interface CalendarEntry {
  id: number;
  name: string;
  gradeLevel: number;
  dayOfWeek: number;      // 0=Sun … 6=Sat
  startTimeUtc: string;   // 'HH:MM:SS'
  durationMinutes: number;
  teacherName: string;
  batchName?: string | null;
  hasMeeting: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Convert the stored UTC weekday + time into the viewer's local weekday and
 * minutes-from-midnight. Classes are stored in UTC, but a parent in BC and a
 * teacher in IST must each see their own local time — and crossing midnight
 * can shift the weekday, which naive formatting gets wrong.
 */
function toLocal(dayOfWeek: number, startTimeUtc: string) {
  const [h, m] = startTimeUtc.split(':').map(Number);
  // Anchor to a known Sunday, then offset to the class's UTC weekday.
  const anchor = new Date(Date.UTC(2024, 0, 7 + dayOfWeek, h || 0, m || 0));
  return {
    day: anchor.getDay(),
    minutes: anchor.getHours() * 60 + anchor.getMinutes(),
    label: anchor.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}

export function WeeklyCalendar({
  entries,
  emptyMessage = 'No classes scheduled yet.',
}: {
  entries: CalendarEntry[];
  emptyMessage?: string;
}) {
  const byDay = useMemo(() => {
    const map: Record<number, (CalendarEntry & { localLabel: string; sortKey: number })[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    };
    for (const e of entries) {
      const { day, minutes, label } = toLocal(e.dayOfWeek, e.startTimeUtc);
      map[day].push({ ...e, localLabel: label, sortKey: minutes });
    }
    for (const d of Object.keys(map)) map[Number(d)].sort((a, b) => a.sortKey - b.sortKey);
    return map;
  }, [entries]);

  const todayIdx = new Date().getDay();

  if (entries.length === 0) {
    return (
      <div className="am-card p-10 text-center">
        <p className="text-[var(--am-ink-500)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="am-card overflow-x-auto">
      <div className="min-w-[760px] grid grid-cols-7">
        {DAYS.map((label, i) => (
          <div
            key={label}
            className="border-r last:border-r-0"
            style={{ borderColor: 'var(--am-hairline)' }}
          >
            <div
              className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-widest sticky top-0"
              style={
                i === todayIdx
                  ? { background: 'var(--am-purple)', color: '#fff' }
                  : { background: 'rgba(118,75,162,0.04)', color: 'var(--am-ink-400)' }
              }
            >
              {label}
            </div>

            <div className="p-2 space-y-2 min-h-[160px]">
              {byDay[i].length === 0 ? (
                <div className="h-full flex items-center justify-center py-6">
                  <span className="text-[var(--am-ink-400)] text-xs">—</span>
                </div>
              ) : (
                byDay[i].map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl p-2.5 text-left"
                    style={{
                      background: 'rgba(118,75,162,0.08)',
                      border: '1px solid rgba(118,75,162,0.18)',
                    }}
                  >
                    <div className="text-xs font-bold" style={{ color: 'var(--am-purple)' }}>
                      {e.localLabel}
                    </div>
                    <div className="text-sm font-semibold leading-tight mt-0.5" style={{ color: 'var(--am-navy)' }}>
                      {e.name}
                    </div>
                    <div className="text-[11px] text-[var(--am-ink-400)] mt-0.5">
                      Grade {e.gradeLevel} · {e.durationMinutes} min
                      {e.batchName ? ` · ${e.batchName}` : ''}
                    </div>
                    {!e.hasMeeting && (
                      <div className="text-[11px] mt-1 font-semibold" style={{ color: '#d97706' }}>
                        No Zoom link yet
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="px-4 py-2.5 text-[11px] text-[var(--am-ink-400)] border-t" style={{ borderColor: 'var(--am-hairline)' }}>
        Times shown in your local timezone.
      </p>
    </div>
  );
}
