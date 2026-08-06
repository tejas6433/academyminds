'use client';

import Link from 'next/link';
import { useEffect } from 'react';

// Boundary for every page under (dashboard) — the marketing pages and the whole
// signed-in dashboard. Turns a thrown server-action error (e.g. an authorization
// failure) into a styled, recoverable screen instead of a white page.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[boundary]', error);
  }, [error]);

  return (
    <main style={{ background: 'var(--am-bg-light)' }} className="min-h-[60dvh] flex items-center justify-center px-6 py-24">
      <div className="am-card p-10 text-center max-w-lg w-full">
        <div
          className="mx-auto mb-5 h-12 w-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(118,75,162,0.1)' }}
          aria-hidden
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="var(--am-purple)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <h1 className="am-heading text-2xl mb-2" style={{ color: 'var(--am-navy)' }}>
          Something went wrong
        </h1>
        <p className="text-[var(--am-ink-500)] mb-6 leading-relaxed">
          {error.message === 'Not your class' || error.message === 'Forbidden'
            ? "You don't have access to that."
            : 'We hit an unexpected error loading this page. Trying again usually fixes it.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="am-btn am-btn-primary px-8">Try again</button>
          <Link
            href="/dashboard"
            className="am-btn px-8"
            style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-ink-700)' }}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
