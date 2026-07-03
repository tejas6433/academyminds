// components/dashboard/class-schedule.tsx
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

interface ScheduledClass {
  id: number;
  name: string;
  subject: 'math' | 'coding';
  teacherName: string;
  startsAt: Date;
  durationMinutes: number;
  joinUrl?: string;
  status: 'upcoming' | 'live' | 'completed' | 'missed';
}

interface ClassScheduleProps {
  classes: ScheduledClass[];
}

const STATUS_STYLES: Record<ScheduledClass['status'], { bg: string; color: string; label: string; dot?: boolean }> = {
  live: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Live Now', dot: true },
  upcoming: { bg: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)', label: 'Upcoming' },
  completed: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Completed', dot: true },
  missed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Missed' },
};

function toCalendarClass(c: ScheduledClass): CalendarClass {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    gradeLevel: 6,
    teacherName: c.teacherName,
    startTimeIso: c.startsAt.toISOString(),
    durationMinutes: c.durationMinutes,
    joinUrl: c.joinUrl,
    rrule: 'FREQ=WEEKLY',
  };
}

export function ClassSchedule({ classes }: ClassScheduleProps) {
  if (classes.length === 0) {
    return (
      <div className="am-card p-8 text-center">
        <p className="text-[var(--am-ink-400)] text-sm">No classes scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {classes.map((c) => {
        const s = STATUS_STYLES[c.status];
        const timeStr = c.startsAt.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true });

        return (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all hover:shadow-[var(--am-shadow-md)] hover:border-[var(--am-hairline-purple)]"
            style={{ background: 'white', border: '1px solid var(--am-hairline)' }}
          >
            <div className="flex items-center gap-3.5">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                style={c.subject === 'math'
                  ? { background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }
                  : { background: 'rgba(26,26,46,0.07)', color: 'var(--am-navy)' }}
                aria-hidden
              >
                {c.subject === 'math' ? 'Σ' : '{}'}
              </span>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--am-navy)' }}>{c.name}</div>
                <div className="text-[var(--am-ink-400)] text-xs mt-0.5">{timeStr} · {c.teacherName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: s.bg, color: s.color }}
              >
                {s.dot && <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'live' ? 'animate-pulse-gold' : ''}`} style={{ background: s.color }} />}
                {s.label}
              </span>
              {(c.status === 'upcoming' || c.status === 'live') && (
                <AddToCalendar classes={[toCalendarClass(c)]} variant="icon" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
