'use client';

import { useState } from 'react';
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
  startsAt: string;
  durationMinutes: number;
  joinUrl: string;
  status: 'upcoming' | 'live' | 'completed' | 'missed';
}

interface Child {
  id: number;
  name: string;
  gradeLevel: number;
  subjectInterest: string;
  next: Instance | null;
  today: Instance[];
  classCount: number;
  /** True once the child has a student login and real enrolments. */
  enrolled: boolean;
  recordingCount: number;
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

export function ParentDashboardView({ greetingName, children }: { greetingName?: string | null; children: Child[] }) {
  const [activeId, setActiveId] = useState(children[0]?.id ?? null);
  const child = children.find((c) => c.id === activeId) ?? null;

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-7">
        <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
          Welcome back{greetingName ? `, ${greetingName}` : ''}
        </h1>
        <p className="text-[var(--am-ink-500)] text-sm mt-1.5">
          {children.length > 0 ? 'Your children and their classes.' : 'Add a child to get started.'}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="am-card p-10 text-center">
          <p className="text-[var(--am-ink-500)] mb-4">
            No children on your account yet. Book a free trial and we&apos;ll set everything up.
          </p>
          <Link href="/enquiry" className="am-btn am-btn-primary px-6 text-sm">Book a free trial</Link>
        </div>
      ) : (
        <>
          {children.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="px-5 py-2.5 rounded-full font-semibold text-sm transition-colors duration-150"
                  style={
                    activeId === c.id
                      ? { background: 'var(--am-purple)', color: '#fff' }
                      : { background: 'var(--am-surface-sunken)', color: 'var(--am-ink-700)', border: '1px solid var(--am-hairline)' }
                  }
                >
                  {c.name} · Grade {c.gradeLevel}
                </button>
              ))}
            </div>
          )}

          {child && (
            <>
              <div className="mb-8">
                <CountdownHero
                  nextClass={
                    child.next
                      ? {
                          name: child.next.name,
                          subject: child.next.subject,
                          teacherName: child.next.teacherName,
                          gradeLevel: child.next.gradeLevel,
                          startsAt: new Date(child.next.startsAt),
                          joinUrl: child.next.joinUrl,
                        }
                      : null
                  }
                  calendarClass={child.next ? toCalendar(child.next) : undefined}
                />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="am-heading text-lg" style={{ color: 'var(--am-navy)' }}>
                  {child.name}&apos;s classes today
                </h2>
                {child.today.length > 0 && (
                  <AddToCalendar classes={child.today.map(toCalendar)} label="Sync to calendar" />
                )}
              </div>

              {child.today.length > 0 ? (
                <ClassSchedule
                  classes={child.today.map((c) => ({
                    id: c.id,
                    name: c.name,
                    subject: c.subject,
                    teacherName: c.teacherName,
                    startsAt: new Date(c.startsAt),
                    durationMinutes: c.durationMinutes,
                    joinUrl: c.joinUrl || undefined,
                    status: c.status,
                  }))}
                />
              ) : (
                <div className="am-card p-8 text-center">
                  <p className="text-[var(--am-ink-500)]">
                    {child.classCount === 0
                      ? `No classes are scheduled for Grade ${child.gradeLevel} yet.`
                      : 'No classes today — check back tomorrow.'}
                  </p>
                </div>
              )}

              {!child.enrolled && (
                <div
                  className="am-card p-5 mt-4 text-sm"
                  style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.35)', color: '#946c00' }}
                >
                  These are the classes offered for Grade {child.gradeLevel}. Once we set up
                  {' '}{child.name}&apos;s login, this will show their actual timetable — we&apos;ll email you the details.
                </div>
              )}

              {child.enrolled && (
                <div className="am-card p-5 mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--am-navy)' }}>
                      {child.recordingCount} class recording{child.recordingCount === 1 ? '' : 's'} available
                    </p>
                    <p className="text-xs text-[var(--am-ink-400)] mt-0.5">
                      {child.name} can rewatch any class for 30 days from their own login.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
