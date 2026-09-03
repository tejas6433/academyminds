'use client';

import { useState, useTransition } from 'react';
import { enrollStudent } from '@/lib/actions/classes';

interface StudentOption {
  id: number;
  name: string | null;
  email: string;
}

// Enrol an existing student into a class. Previously the only way a student
// could join a class was at account-creation time, so there was no way to add
// a trial student, or move an existing one into a second class.
export function AdminEnrollCell({ classId, students }: { classId: number; students: StudentOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function submit() {
    if (!studentId) return;
    setResult(null);
    startTransition(async () => {
      try {
        const res = await enrollStudent(classId, Number(studentId));
        setResult({
          ok: true,
          msg: 'alreadyEnrolled' in res && res.alreadyEnrolled ? 'Already enrolled.' : 'Enrolled.',
        });
        setStudentId('');
      } catch (e) {
        setResult({ ok: false, msg: e instanceof Error ? e.message : 'Failed to enrol' });
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold underline"
        style={{ color: 'var(--am-purple)' }}
      >
        Enrol student
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1.5 items-start">
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="px-2 py-1 rounded-lg border text-xs outline-none max-w-[190px]"
        style={{ borderColor: 'var(--am-hairline-strong)' }}
      >
        <option value="">Select a student…</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>{s.name || s.email}</option>
        ))}
      </select>
      <span className="inline-flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !studentId}
          className="text-xs font-bold disabled:opacity-50"
          style={{ color: 'var(--am-purple)' }}
        >
          {pending ? 'Enrolling…' : 'Add'}
        </button>
        <button onClick={() => { setOpen(false); setResult(null); }} className="text-xs text-[var(--am-ink-400)]">
          Cancel
        </button>
      </span>
      {result && (
        <span className="text-xs" style={{ color: result.ok ? '#16a34a' : '#dc2626' }}>{result.msg}</span>
      )}
    </span>
  );
}
