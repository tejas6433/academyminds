'use client';

// Last-resort boundary: catches errors thrown in the root layout itself, where
// no other boundary can help. Must render its own <html>/<body> because the
// root layout is what failed.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif', background: '#faf9f7' }}>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: 'center' }}>
            <h1 style={{ fontSize: 28, color: '#1a1a2e', margin: '0 0 12px' }}>Something went wrong</h1>
            <p style={{ color: '#4a4660', lineHeight: 1.6, margin: '0 0 24px' }}>
              We hit an unexpected error. Trying again usually fixes it — if it keeps
              happening, email support@academyminds.com.
            </p>
            <button
              onClick={reset}
              style={{ background: '#764ba2', color: '#fff', border: 0, fontWeight: 700, padding: '12px 26px', borderRadius: 999, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
