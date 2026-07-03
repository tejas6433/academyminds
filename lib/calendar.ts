// lib/calendar.ts

export interface CalendarClass {
  id: number | string;
  name: string;
  teacherName: string;
  subject: 'math' | 'coding';
  gradeLevel: number;
  /** ISO 8601 datetime string for first occurrence, e.g. "2026-06-09T16:00:00Z" */
  startTimeIso: string;
  durationMinutes: number;
  joinUrl?: string;
  /** iCal RRULE value, e.g. "FREQ=WEEKLY" */
  rrule?: string;
}

function formatIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, '').replace('.000', '');
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(new Date(iso).getTime() + minutes * 60000);
  return d.toISOString();
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateIcs(classes: CalendarClass[]): string {
  const events = classes.map((c) => {
    const dtstart = formatIcsDate(c.startTimeIso);
    const dtend = formatIcsDate(addMinutes(c.startTimeIso, c.durationMinutes));
    const summary = escapeIcsText(`AcademyMinds — ${c.subject === 'math' ? 'Math' : 'Coding'}: ${c.name} (Grade ${c.gradeLevel})`);
    const description = escapeIcsText(`Teacher: ${c.teacherName}${c.joinUrl ? `\nJoin link: ${c.joinUrl}` : ''}`);
    const location = c.joinUrl ? escapeIcsText(c.joinUrl) : '';
    const rrule = c.rrule ? `RRULE:${c.rrule}\r\n` : '';

    return [
      'BEGIN:VEVENT',
      `UID:am-class-${c.id}@academyminds.com`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `${rrule}SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${location}` : '',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AcademyMinds//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildGoogleCalendarUrl(c: CalendarClass): string {
  const start = c.startTimeIso.replace(/[-:]/g, '').replace('.000Z', 'Z');
  const end = addMinutes(c.startTimeIso, c.durationMinutes).replace(/[-:]/g, '').replace('.000Z', 'Z');
  const title = encodeURIComponent(`AcademyMinds — ${c.subject === 'math' ? 'Math' : 'Coding'}: ${c.name}`);
  const details = encodeURIComponent(`Teacher: ${c.teacherName}${c.joinUrl ? `\nJoin: ${c.joinUrl}` : ''}`);
  const location = c.joinUrl ? encodeURIComponent(c.joinUrl) : '';
  const recur = c.rrule ? `&recur=RRULE:${encodeURIComponent(c.rrule)}` : '';
  return `https://calendar.google.com/calendar/r?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}${recur}`;
}
