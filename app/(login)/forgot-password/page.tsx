'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset } from '../actions';
import { ActionState } from '@/lib/auth/middleware';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordReset,
    { error: '' }
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--am-bg-light)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--am-navy)' }}>
            Academy<span style={{ color: 'var(--am-purple)' }}>Minds</span>
          </Link>
        </div>

        <div className="am-card p-8">
          <h1 className="am-heading text-2xl mb-2" style={{ color: 'var(--am-navy)' }}>Reset your password</h1>
          <p className="text-[var(--am-ink-500)] text-sm mb-6">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>

          {state?.success ? (
            <p className="text-sm p-4 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d' }}>
              {state.success}
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--am-navy)' }}>Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="am-input w-full px-4 py-3 rounded-[var(--am-radius-input)] border outline-none transition-shadow"
                  style={{ borderColor: 'var(--am-hairline-strong)' }}
                />
              </div>
              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
              <button type="submit" disabled={pending} className="am-btn am-btn-primary w-full disabled:opacity-60">
                {pending ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[var(--am-ink-500)] mt-6">
            <Link href="/sign-in" style={{ color: 'var(--am-purple)' }} className="font-medium">Back to sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
