'use client';

import { useState, useTransition } from 'react';
import { createStudentAccount } from '@/lib/actions/classes';

interface ClassOption {
  id: number;
  name: string;
}

// Admin tool: create a student login for a paying parent's child, optionally
// enroll them in a class, and email the credentials to the parent.
export function CreateStudentForm({ parentEmail, classes }: { parentEmail: string; classes: ClassOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [classId, setClassId] = useState<string>('');
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function submit() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await createStudentAccount({
          studentName,
          studentEmail,
          parentEmail,
          classId: classId ? Number(classId) : undefined,
        });
        if (res.ok) {
          setResult({
            ok: true,
            msg: `Account created for ${studentEmail}. Temp password: ${res.tempPassword} — also emailed to ${parentEmail}. Share it if the email doesn't arrive.`,
          });
          setStudentName('');
          setStudentEmail('');
          setClassId('');
        } else {
          setResult({ ok: false, msg: res.error });
        }
      } catch {
        setResult({ ok: false, msg: 'Something went wrong. Please try again.' });
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="am-btn px-3 py-1.5 text-xs"
        style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-purple)' }}
      >
        + Create student
      </button>
    );
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inputStyle = { borderColor: 'var(--am-hairline-strong)' } as const;

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--am-surface-sunken)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Student name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Student email"
          type="email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
        />
      </div>
      <select className={`${inputCls} mb-2`} style={inputStyle} value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="">No class yet (enroll later)</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !studentName || !studentEmail}
          className="am-btn am-btn-primary px-4 py-1.5 text-xs disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create + email login'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-[var(--am-ink-400)]">Cancel</button>
      </div>
      {result && (
        <p className="text-xs mt-2 font-medium" style={{ color: result.ok ? '#16a34a' : '#dc2626' }}>{result.msg}</p>
      )}
    </div>
  );
}
