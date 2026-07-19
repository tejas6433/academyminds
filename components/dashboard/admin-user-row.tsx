'use client';

import { useState, useTransition } from 'react';
import { setUserRole } from '@/lib/actions/classes';
import { deleteUser } from '@/lib/actions/admin';

const ROLES = ['student', 'parent', 'teacher', 'admin', 'member'];

export function AdminUserRow({
  user,
}: {
  user: { id: number; name: string | null; email: string; role: string };
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(user.role);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');

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

  function remove() {
    if (!confirm(`Permanently delete ${user.email} and all their data? This cannot be undone.`)) return;
    setError('');
    startTransition(async () => {
      try {
        await deleteUser(user.id);
        setDeleted(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    });
  }

  if (deleted) return null;

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
      <td className="py-3.5 px-5 align-middle whitespace-nowrap">
        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/users/${user.id}/export`}
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--am-purple)' }}
          >
            Export
          </a>
          <button
            onClick={remove}
            disabled={pending}
            className="text-xs font-semibold hover:underline disabled:opacity-50"
            style={{ color: '#dc2626' }}
          >
            Delete
          </button>
        </div>
        {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
      </td>
    </tr>
  );
}
