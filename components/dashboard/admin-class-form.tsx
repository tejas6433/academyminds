'use client';

import { useState, useTransition } from 'react';
import { createClass } from '@/lib/actions/classes';

const DAYS = [
  { v: 1, label: 'Mon' },
  { v: 2, label: 'Tue' },
  { v: 3, label: 'Wed' },
  { v: 4, label: 'Thu' },
  { v: 5, label: 'Fri' },
  { v: 6, label: 'Sat' },
  { v: 0, label: 'Sun' },
];

interface Teacher {
  id: number;
  name: string | null;
  email: string;
}

export function AdminClassForm({ teachers }: { teachers: Teacher[] }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [batchName, setBatchName] = useState('');
  const [grade, setGrade] = useState(6);
  const [teacherId, setTeacherId] = useState<string>('');
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('16:00');
  const [duration, setDuration] = useState(60);

  function submit() {
    setError('');
    if (!name.trim()) {
      setError('Class name is required.');
      return;
    }
    const teacher = teachers.find((t) => String(t.id) === teacherId);
    startTransition(async () => {
      try {
        await createClass({
          name: name.trim(),
          batchName: batchName.trim() || undefined,
          gradeLevel: grade,
          teacherId: teacher ? teacher.id : null,
          teacherName: teacher ? teacher.name ?? teacher.email : 'TBD',
          dayOfWeek: day,
          startTimeUtc: `${time}:00`,
          durationMinutes: duration,
        });
        setName('');
        setTeacherId('');
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create class');
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="am-btn am-btn-primary px-5 text-sm"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        New Class
      </button>
    );
  }

  const inputCls = 'am-input w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-shadow';
  const ring = { borderColor: 'var(--am-hairline-strong)' };

  return (
    <div className="am-card-raised p-6 w-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-base" style={{ color: 'var(--am-navy)' }}>New Class</h3>
        <button onClick={() => setOpen(false)} className="text-[var(--am-ink-400)] text-sm hover:text-[var(--am-ink-700)] transition-colors">Cancel</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Class Name</label>
          <input className={inputCls} style={ring} value={name} onChange={(e) => setName(e.target.value)} placeholder="Algebra — Chapter 3" />
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Batch name</label>
          <input className={inputCls} style={ring} value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="Morning Batch" />
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Grade</label>
          <select className={inputCls} style={ring} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            <option value={5}>Grade 5</option>
            <option value={6}>Grade 6</option>
            <option value={7}>Grade 7</option>
          </select>
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Teacher</label>
          <select className={inputCls} style={ring} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            <option value="">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name ?? t.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Day</label>
          <select className={inputCls} style={ring} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAYS.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Start (UTC)</label>
          <input type="time" className={inputCls} style={ring} value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div>
          <label className="block am-eyebrow text-[var(--am-ink-400)] mb-1.5">Duration (min)</label>
          <input type="number" min={15} step={15} className={inputCls} style={ring} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <button
        onClick={submit}
        disabled={pending}
        className="am-btn am-btn-primary mt-5 px-6 text-sm disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create Class'}
      </button>
    </div>
  );
}
