'use client';

import Link from 'next/link';
import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPassword } from '../actions';
import { ActionState } from '@/lib/auth/middleware';

export default function ResetPasswordPage() {
  // useSearchParams must be inside a Suspense boundary for static prerender.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
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
          <h1 className="am-heading text-2xl mb-2" style={{ color: 'var(--am-navy)' }}>Set a new password</h1>
          <p className="text-[var(--am-ink-500)] text-sm mb-6">Choose a new password for your account.</p>

          {!token ? (
            <p className="text-red-500 text-sm">
              Missing reset token. Please use the link from your email, or{' '}
              <Link href="/forgot-password" className="underline" style={{ color: 'var(--am-purple)' }}>request a new one</Link>.
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--am-navy)' }}>New password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="am-input w-full px-4 py-3 rounded-[var(--am-radius-input)] border outline-none transition-shadow"
                  style={{ borderColor: 'var(--am-hairline-strong)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--am-navy)' }}>Confirm password</label>
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Re-enter password"
                  className="am-input w-full px-4 py-3 rounded-[var(--am-radius-input)] border outline-none transition-shadow"
                  style={{ borderColor: 'var(--am-hairline-strong)' }}
                />
              </div>
              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
              <button type="submit" disabled={pending} className="am-btn am-btn-primary w-full disabled:opacity-60">
                {pending ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
