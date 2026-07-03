// lib/schedule.ts
// Turns stored class rows (weekly dayOfWeek + startTimeUtc) into concrete
// upcoming instances with a live/upcoming/completed status. Pure + testable.

export interface ClassRow {
  id: number;
  name: string;
  subject: string; // 'math' | 'coding'
  gradeLevel: number;
  teacherName: string;
  dayOfWeek: number; // 0=Sun..6=Sat
  startTimeUtc: string; // 'HH:MM:SS'
  durationMinutes: number;
  joinUrl: string | null;
}

export interface ScheduledInstance {
  id: number;
  name: string;
  subject: 'math' | 'coding';
  teacherName: string;
  gradeLevel: number;
  startsAt: Date;
  durationMinutes: number;
  joinUrl: string;
  status: 'upcoming' | 'live' | 'completed' | 'missed';
}

/** Next future UTC datetime for a weekly class (today counts if still ahead). */
export function nextOccurrence(dayOfWeek: number, startTimeUtc: string, now = new Date()): Date {
  const [h, m, s] = startTimeUtc.split(':').map((n) => parseInt(n, 10) || 0);
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, s));
  let delta = (dayOfWeek - d.getUTCDay() + 7) % 7;
  if (delta === 0 && d.getTime() <= now.getTime()) delta = 7;
  d.setUTCDate(d.getUTCDate() + delta);
  return d;
}

function subjectOf(s: string): 'math' | 'coding' {
  return s === 'coding' ? 'coding' : 'math';
}

/** The single next class instance across a set of classes, or null. */
export function nextClassInstance(classes: ClassRow[], now = new Date()): ScheduledInstance | null {
  if (classes.length === 0) return null;
  const withDates = classes.map((c) => ({ c, at: nextOccurrence(c.dayOfWeek, c.startTimeUtc, now) }));
  withDates.sort((a, b) => a.at.getTime() - b.at.getTime());
  const { c, at } = withDates[0];
  return {
    id: c.id,
    name: c.name,
    subject: subjectOf(c.subject),
    teacherName: c.teacherName,
    gradeLevel: c.gradeLevel,
    startsAt: at,
    durationMinutes: c.durationMinutes,
    joinUrl: c.joinUrl ?? '',
    status: instanceStatus(at, c.durationMinutes, now),
  };
}

function instanceStatus(startsAt: Date, durationMinutes: number, now: Date): ScheduledInstance['status'] {
  const start = startsAt.getTime();
  const end = start + durationMinutes * 60_000;
  const t = now.getTime();
  if (t >= start && t <= end) return 'live';
  if (t > end) return 'completed';
  return 'upcoming';
}

/** Classes that meet today (UTC), as concrete instances, sorted by time. */
export function todaysClasses(classes: ClassRow[], now = new Date()): ScheduledInstance[] {
  const today = now.getUTCDay();
  return classes
    .filter((c) => c.dayOfWeek === today)
    .map((c) => {
      const [h, m, s] = c.startTimeUtc.split(':').map((n) => parseInt(n, 10) || 0);
      const at = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, s));
      return {
        id: c.id,
        name: c.name,
        subject: subjectOf(c.subject),
        teacherName: c.teacherName,
        gradeLevel: c.gradeLevel,
        startsAt: at,
        durationMinutes: c.durationMinutes,
        joinUrl: c.joinUrl ?? '',
        status: instanceStatus(at, c.durationMinutes, now),
      };
    })
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}
