'use client';

import { useState, useTransition } from 'react';
import { deleteRecording } from '@/lib/actions/classes';

// Admin-only permanent delete for a single recording. Two-step confirm because
// this destroys the video file itself — unlike hiding, it cannot be undone.
export function DeleteRecordingButton({ recordingId, title }: { recordingId: number; title: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  function remove() {
    setError('');
    startTransition(async () => {
      try {
        const res = await deleteRecording(recordingId);
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
        className="text-xs font-semibold shrink-0"
        style={{ color: '#dc2626' }}
        aria-label={`Delete recording ${title}`}
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1 shrink-0">
      <span className="inline-flex items-center gap-2 text-xs">
        <button onClick={remove} disabled={pending} className="font-bold disabled:opacity-60" style={{ color: '#dc2626' }}>
          {pending ? 'Deleting…' : 'Delete permanently'}
        </button>
        <button onClick={() => { setConfirming(false); setError(''); }} className="text-[var(--am-ink-400)]">
          Cancel
        </button>
      </span>
      {error && <span className="text-xs text-right max-w-[220px]" style={{ color: '#dc2626' }}>{error}</span>}
    </span>
  );
}
