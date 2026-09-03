'use client';

import { useState, useTransition } from 'react';
import { setRecordingPublished } from '@/lib/actions/classes';

// Publish / hide a recording from the recordings list. Previously this control
// lived only on the teacher dashboard, so an admin could permanently delete a
// recording but had no way to simply take it out of view.
export function RecordingVisibilityToggle({
  recordingId,
  published,
}: {
  recordingId: number;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(published);
  const [error, setError] = useState('');

  function toggle() {
    setError('');
    startTransition(async () => {
      try {
        await setRecordingPublished(recordingId, !isPublished);
        setIsPublished((v) => !v);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={toggle}
        disabled={pending}
        className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap disabled:opacity-60"
        style={
          isPublished
            ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
            : { background: 'rgba(107,114,128,0.12)', color: '#6b7280' }
        }
        title={isPublished ? 'Visible to students — click to hide' : 'Hidden from students — click to publish'}
      >
        {pending ? '…' : isPublished ? 'Published' : 'Hidden'}
      </button>
      {error && <span className="text-xs" style={{ color: '#dc2626' }}>{error}</span>}
    </span>
  );
}
