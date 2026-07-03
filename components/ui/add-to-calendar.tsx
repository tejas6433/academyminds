// components/ui/add-to-calendar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarClass, generateIcs, buildGoogleCalendarUrl } from '@/lib/calendar';
import { CalendarPlus } from 'lucide-react';

interface AddToCalendarProps {
  classes: CalendarClass[];
  label?: string;
  variant?: 'icon' | 'button';
  /** 'light' renders the trigger in white for use on dark/purple surfaces */
  tone?: 'default' | 'light';
}

export function AddToCalendar({ classes, label = 'Add to Calendar', variant = 'button', tone = 'default' }: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function downloadIcs() {
    const content = generateIcs(classes);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academyminds-classes.ics';
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  function openGoogle() {
    const url = buildGoogleCalendarUrl(classes[0]);
    window.open(url, '_blank');
    setOpen(false);
  }

  const OPTIONS = [
    { label: 'Google Calendar', action: openGoogle },
    { label: 'Apple Calendar (.ics)', action: downloadIcs },
    { label: 'Outlook (.ics)', action: downloadIcs },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={label}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={
          variant === 'button'
            ? {
                minHeight: 40,
                padding: '8px 16px',
                borderRadius: '999px',
                border: `1.5px solid ${tone === 'light' ? 'rgba(255,255,255,0.4)' : 'var(--am-purple)'}`,
                color: tone === 'light' ? '#fff' : 'var(--am-purple)',
              }
            : tone === 'light'
              ? {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 36,
                  width: 36,
                  borderRadius: '999px',
                  color: '#fff',
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.24)',
                }
              : { color: 'var(--am-purple)' }
        }
        title={label}
      >
        <CalendarPlus className="h-4 w-4" />
        {variant === 'button' && <span>{label}</span>}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 right-0 rounded-xl overflow-hidden"
          style={{ background: 'white', border: '1px solid var(--am-hairline)', boxShadow: 'var(--am-shadow-lg)', minWidth: '210px' }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[rgba(118,75,162,0.04)] flex items-center gap-3 transition-colors"
              style={{ color: 'var(--am-ink-700)' }}
            >
              <CalendarPlus className="h-4 w-4" style={{ color: 'var(--am-purple)' }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
