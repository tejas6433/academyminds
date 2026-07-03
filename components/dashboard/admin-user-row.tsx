'use client';

import { useState, useTransition } from 'react';
import { setUserRole } from '@/lib/actions/classes';

const ROLES = ['student', 'parent', 'teacher', 'admin', 'member'];

export function AdminUserRow({
  user,
}: {
  user: { id: number; name: string | null; email: string; role: string };
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(user.role);

  function change(newRole: string) {
    const prev = role;
    setRole(newRole);
    startTransition(async () => {
      try {
        await setUserRole(user.id, newRole);
      } catch {
        setRole(prev);
      }
    });
  }

  return (
    <tr className="transition-colors hover:bg-[rgba(118,75,162,0.025)]" style={{ borderTop: '1px solid var(--am-hairline)' }}>
      <td className="py-3.5 px-5 align-middle">
        <div className="flex items-center gap-2.5">
          <span
            className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white leading-none"
            style={{ background: 'var(--am-gradient)' }}
          >
            {(user.name ?? user.email)[0].toUpperCase()}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--am-navy)' }}>{user.name ?? '—'}</span>
        </div>
      </td>
      <td className="py-3.5 px-5 align-middle text-sm text-[var(--am-ink-500)]">{user.email}</td>
      <td className="py-3.5 px-5 align-middle">
        <select
          value={role}
          disabled={pending}
          onChange={(e) => change(e.target.value)}
          className="am-input px-3 py-1.5 rounded-lg border text-sm capitalize outline-none transition-shadow disabled:opacity-60"
          style={{ borderColor: 'var(--am-hairline-strong)' }}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </td>
    </tr>
  );
}
