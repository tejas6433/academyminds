'use client';

import { useState, useTransition } from 'react';
import { updateClass, unenrollStudent } from '@/lib/actions/classes';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Person { id: number; name: string | null; email: string }

interface Props {
  cls: {
    id: number;
    name: string;
    batchName: string | null;
    gradeLevel: number;
    teacherId: number | null;
    dayOfWeek: number;
    startTimeUtc: string;
    durationMinutes: number;
  };
  teachers: Person[];
  roster: Person[];
}

// Edit a class and manage its roster. Previously the only way to fix a wrong
// time or teacher was to delete and recreate the class, which destroyed its
// Zoom meeting and recordings.
export function ClassManager({ cls, teachers, roster }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(cls.name);
  const [batchName, setBatchName] = useState(cls.batchName ?? '');
  const [grade, setGrade] = useState(cls.gradeLevel);
  const [teacherId, setTeacherId] = useState(cls.teacherId ? String(cls.teacherId) : '');
  const [day, setDay] = useState(cls.dayOfWeek);
  const [time, setTime] = useState(cls.startTimeUtc.slice(0, 5));
  const [duration, setDuration] = useState(cls.durationMinutes);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [currentRoster, setCurrentRoster] = useState(roster);

  function save() {
    setMsg(null);
    startTransition(async () => {
      const teacher = teachers.find((t) => String(t.id) === teacherId);
      const res = await updateClass({
        classId: cls.id,
        name,
        batchName,
        gradeLevel: grade,
        teacherId: teacher ? teacher.id : null,
        teacherName: teacher ? teacher.name ?? teacher.email : 'TBD',
        dayOfWeek: day,
        startTimeUtc: `${time}:00`,
        durationMinutes: duration,
      });
      if (!res.ok) { setMsg({ ok: false, text: res.error }); return; }
      setMsg({
        ok: true,
        text: res.scheduleChangedWithMeeting
          ? 'Saved. The schedule changed — delete and recreate the Zoom meeting so the invite matches.'
          : 'Saved.',
      });
    });
  }

  function remove(studentId: number) {
    startTransition(async () => {
      await unenrollStudent(cls.id, studentId);
      setCurrentRoster((r) => r.filter((s) => s.id !== studentId));
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-semibold underline" style={{ color: 'var(--am-purple)' }}>
        Manage
      </button>
    );
  }

  const inputCls = 'w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none';
  const ring = { borderColor: 'var(--am-hairline-strong)' } as const;

  return (
    <div className="am-card p-4 mt-2 text-left" style={{ minWidth: 300 }}>
      <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>Edit class</p>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className={inputCls} style={ring} value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name" />
        <input className={inputCls} style={ring} value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="Batch name" />
        <select className={inputCls} style={ring} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
          {[5, 6, 7].map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select className={inputCls} style={ring} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          <option value="">No teacher</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name ?? t.email}</option>)}
        </select>
        <select className={inputCls} style={ring} value={day} onChange={(e) => setDay(Number(e.target.value))}>
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        <input type="time" className={inputCls} style={ring} value={time} onChange={(e) => setTime(e.target.value)} />
        <input type="number" min={15} step={15} className={inputCls} style={ring} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>
      <p className="text-[11px] text-[var(--am-ink-400)] mb-3">Time is UTC. Students see it in their own timezone.</p>

      <div className="flex items-center gap-2 mb-3">
        <button onClick={save} disabled={pending || !name.trim()} className="am-btn am-btn-primary px-3 py-1 text-xs disabled:opacity-60">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        <button onClick={() => { setOpen(false); setMsg(null); }} className="text-xs text-[var(--am-ink-400)]">Close</button>
      </div>
      {msg && <p className="text-xs mb-3 font-medium" style={{ color: msg.ok ? '#16a34a' : '#dc2626' }}>{msg.text}</p>}

      <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>
        Roster ({currentRoster.length})
      </p>
      {currentRoster.length === 0 ? (
        <p className="text-xs text-[var(--am-ink-400)]">No students enrolled yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {currentRoster.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate" style={{ color: 'var(--am-navy)' }}>{s.name ?? s.email}</span>
              <button onClick={() => remove(s.id)} disabled={pending} className="font-semibold shrink-0 disabled:opacity-50" style={{ color: '#dc2626' }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
