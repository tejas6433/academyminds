'use client';

import { useState, useTransition } from 'react';
import { createMeetingForClass } from '@/lib/actions/classes';

// Zoom column in the admin classes table. Shows "Ready" once a meeting exists,
// otherwise offers to create one. The server action already allows admins —
// previously only the teacher dashboard exposed this, so an admin could see
// that a class had no meeting but had no way to create it.
export function AdminZoomCell({ classId, hasMeeting }: { classId: number; hasMeeting: boolean }) {
  const [pending, startTransition] = useTransition();
  const [ready, setReady] = useState(hasMeeting);
  const [error, setError] = useState('');

  function create() {
    setError('');
    startTransition(async () => {
      try {
        await createMeetingForClass(classId);
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to create meeting');
      }
    });
  }

  if (ready) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#16a34a' }} />
        Ready
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        onClick={create}
        disabled={pending}
        className="text-xs font-semibold underline disabled:opacity-60 text-left"
        style={{ color: 'var(--am-purple)' }}
      >
        {pending ? 'Creating…' : 'Create meeting'}
      </button>
      {error && <span className="text-xs" style={{ color: '#dc2626' }}>{error}</span>}
    </span>
  );
}
