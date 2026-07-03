'use client';

import Link from 'next/link';
import { CountdownHero } from '@/components/dashboard/countdown-hero';
import { ClassSchedule } from '@/components/dashboard/class-schedule';
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

interface Instance {
  id: number;
  name: string;
  subject: 'math' | 'coding';
  teacherName: string;
  gradeLevel: number;
  startsAt: string; // ISO
  durationMinutes: number;
  joinUrl: string;
  status: 'upcoming' | 'live' | 'completed' | 'missed';
}

interface Props {
  greetingName?: string | null;
  next: Instance | null;
  today: Instance[];
  stats: { enrolled: number; subjects: number; recordings: number };
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function toCalendar(c: Instance): CalendarClass {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    gradeLevel: c.gradeLevel,
    teacherName: c.teacherName,
    startTimeIso: c.startsAt,
    durationMinutes: c.durationMinutes,
    joinUrl: c.joinUrl || undefined,
    rrule: 'FREQ=WEEKLY',
  };
}

export function StudentDashboardView({ greetingName, next, today, stats }: Props) {
  const nextClass = next
    ? {
        name: next.name,
        subject: next.subject,
        teacherName: next.teacherName,
        gradeLevel: next.gradeLevel,
        startsAt: new Date(next.startsAt),
        joinUrl: next.joinUrl,
      }
    : null;

  const todayForSchedule = today.map((c) => ({
    id: c.id,
    name: c.name,
    subject: c.subject,
    teacherName: c.teacherName,
    startsAt: new Date(c.startsAt),
    durationMinutes: c.durationMinutes,
    joinUrl: c.joinUrl || undefined,
    status: c.status,
  }));

  const statCards = [
    { label: 'Enrolled classes', value: String(stats.enrolled) },
    { label: 'Subjects', value: String(stats.subjects) },
    { label: 'Recordings', value: String(stats.recordings) },
  ];

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-7">
        <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
          {timeGreeting()}{greetingName ? `, ${greetingName}` : ''}
        </h1>
        <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Here&apos;s your class schedule.</p>
      </div>

      <div className="mb-8">
        <CountdownHero
          nextClass={nextClass}
          calendarClass={next ? toCalendar(next) : undefined}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-9">
        {statCards.map((stat) => (
          <div key={stat.label} className="am-card am-card-hover p-5 text-center">
            <div className="text-2xl font-bold tracking-tight" style={{ color: 'var(--am-purple)' }}>{stat.value}</div>
            <div className="text-[var(--am-ink-400)] text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="am-heading text-lg" style={{ color: 'var(--am-navy)' }}>Today&apos;s classes</h2>
        {today.length > 0 && (
          <AddToCalendar classes={today.map(toCalendar)} label="Sync all to calendar" />
        )}
      </div>

      {todayForSchedule.length > 0 ? (
        <ClassSchedule classes={todayForSchedule} />
      ) : (
        <div className="am-card p-8 text-center">
          <p className="text-[var(--am-ink-500)]">
            {stats.enrolled === 0
              ? 'You’re not enrolled in any classes yet.'
              : 'No classes scheduled for today.'}
          </p>
          {stats.enrolled === 0 && (
            <Link href="/enquiry" className="am-btn am-btn-primary px-6 mt-4 text-sm">
              Book a free trial
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
