'use client';

import { useState, useTransition } from 'react';
import { deleteClass } from '@/lib/actions/classes';

// Admin: delete a class (with confirm). Removes enrollments + recordings too.
export function DeleteClassButton({ classId, className }: { classId: number; className: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  function remove() {
    setError('');
    startTransition(async () => {
      try {
        const res = await deleteClass(classId);
        if (!res.ok) setError(res.error);
      } catch {
        setError('Failed to delete.');
      }
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold"
        style={{ color: '#dc2626' }}
        aria-label={`Delete ${className}`}
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <button onClick={remove} disabled={pending} className="font-bold disabled:opacity-60" style={{ color: '#dc2626' }}>
        {pending ? 'Deleting…' : 'Confirm'}
      </button>
      <button onClick={() => setConfirming(false)} className="text-[var(--am-ink-400)]">Cancel</button>
      {error && <span style={{ color: '#dc2626' }}>{error}</span>}
    </span>
  );
}
