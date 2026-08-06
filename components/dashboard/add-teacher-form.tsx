'use client';

import { useState, useTransition } from 'react';
import { createTeacherAccount } from '@/lib/actions/classes';

// Admin tool: create a teacher login directly (no self-signup + promote dance).
export function AddTeacherForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function submit() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await createTeacherAccount({ name, email });
        if (res.ok) {
          setResult({
            ok: true,
            msg: `Teacher created for ${email}. Temp password: ${res.tempPassword} — also emailed. Share it if the email doesn't arrive.`,
          });
          setName('');
          setEmail('');
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
        className="am-btn px-3 py-1.5 text-sm"
        style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-purple)' }}
      >
        + Add teacher
      </button>
    );
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inputStyle = { borderColor: 'var(--am-hairline-strong)' } as const;

  return (
    <div className="am-card p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input className={inputCls} style={inputStyle} placeholder="Teacher name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} style={inputStyle} placeholder="Teacher email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !name || !email}
          className="am-btn am-btn-primary px-4 py-1.5 text-sm disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create + email login'}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-[var(--am-ink-400)]">Cancel</button>
      </div>
      {result && (
        <p className="text-sm mt-2 font-medium" style={{ color: result.ok ? '#16a34a' : '#dc2626' }}>{result.msg}</p>
      )}
    </div>
  );
}
