// components/dashboard/countdown-hero.tsx
'use client';

import { useEffect, useState } from 'react';
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

interface CountdownHeroProps {
  nextClass: {
    name: string;
    subject: string;
    teacherName: string;
    gradeLevel: number;
    startsAt: Date;
    joinUrl: string;
  } | null;
  calendarClass?: CalendarClass;
}

function useCountdown(target: Date | null) {
  const [diff, setDiff] = useState<number>(0);

  useEffect(() => {
    if (!target) return;
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, totalSec };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function CountdownHero({ nextClass, calendarClass }: CountdownHeroProps) {
  const { h, m, s, totalSec } = useCountdown(nextClass?.startsAt ?? null);
  const canJoin = totalSec <= 600 && totalSec > 0;

  if (!nextClass) {
    return (
      <div className="am-grain rounded-[1.25rem] p-10 text-center relative overflow-hidden" style={{ background: 'var(--am-gradient)' }}>
        <p className="text-white/70 text-lg relative">No upcoming classes scheduled.</p>
      </div>
    );
  }

  return (
    <div className="am-grain rounded-[1.25rem] p-6 sm:p-8 relative overflow-hidden" style={{ background: 'var(--am-gradient)', boxShadow: 'var(--am-shadow-lg)' }}>
      {calendarClass && (
        <div className="absolute top-4 right-4 z-10">
          <AddToCalendar classes={[calendarClass]} variant="icon" tone="light" />
        </div>
      )}

      <div className="relative am-eyebrow mb-2 flex items-center gap-2" style={{ color: 'rgba(255,215,0,0.9)' }}>
        <span className="h-1.5 w-1.5 rounded-full animate-pulse-gold" style={{ background: 'var(--am-gold)' }} />
        Next Class
      </div>

      <h2 className="relative text-white text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">{nextClass.name}</h2>
      <p className="relative text-white/70 text-sm mb-6 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.14)' }} aria-hidden>
          {nextClass.subject === 'math' ? 'Σ' : '{}'}
        </span>
        {nextClass.teacherName} · Grade {nextClass.gradeLevel}
      </p>

      <div className="relative flex items-center gap-3 mb-8">
        {[
          { val: pad(h), label: 'hrs' },
          { val: pad(m), label: 'min' },
          { val: pad(s), label: 'sec' },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            {i > 0 && <span className="text-white/30 text-3xl font-bold">:</span>}
            <div className="text-center min-w-[2.4ch] rounded-xl px-3 py-2" style={{ background: 'rgba(0,0,0,0.16)' }}>
              <div
                className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none"
                style={{ color: 'var(--am-gold)' }}
              >
                {unit.val}
              </div>
              <div className="text-white/45 text-[10px] uppercase tracking-[0.14em] mt-1.5">{unit.label}</div>
            </div>
          </div>
        ))}
      </div>

      {canJoin ? (
        <a
          href={nextClass.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative am-btn am-btn-gold px-8 text-base animate-pulse-gold"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Join Class Now
        </a>
      ) : (
        <div
          className="relative inline-flex items-center gap-2 px-8 rounded-full font-bold text-base cursor-not-allowed"
          style={{ minHeight: 44, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.22)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
          Join opens 10 min before class
        </div>
      )}
    </div>
  );
}
