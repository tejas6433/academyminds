'use client';

import { useState, useTransition } from 'react';
import { createStaffAccount } from '@/lib/actions/classes';

// Create a teacher or an admin. Admins are for a business partner or a manager
// who needs the full dashboard — same creation path, different granted role.
export function AddStaffForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function submit() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await createStaffAccount({ name, email, role });
        if (res.ok) {
          setResult({
            ok: true,
            msg: `${role === 'admin' ? 'Admin' : 'Teacher'} created for ${email}. Temp password: ${res.tempPassword} — also emailed. Share it if the email doesn't arrive.`,
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
        + Add teacher or admin
      </button>
    );
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inputStyle = { borderColor: 'var(--am-hairline-strong)' } as const;

  return (
    <div className="am-card p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <input className={inputCls} style={inputStyle} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} style={inputStyle} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className={inputCls} style={inputStyle} value={role} onChange={(e) => setRole(e.target.value as 'teacher' | 'admin')}>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin (full access)</option>
        </select>
      </div>
      {role === 'admin' && (
        <p className="text-xs mb-2 text-[var(--am-ink-500)]">
          An admin can manage classes, students, teachers, billing views and recordings — the same access you have.
        </p>
      )}
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
