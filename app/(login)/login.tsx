'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const resetOk = searchParams.get('reset') === 'success';

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const isSignUp = mode === 'signup';
  const [accountType, setAccountType] = useState<'parent' | 'student'>('parent');

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="am-grain hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--am-gradient-dark)' }}
      >
        <div className="relative z-10">
          <Link href="/" className="text-white font-bold text-2xl tracking-tight">
            Academy<span style={{ color: 'var(--am-purple-light)' }}>Minds</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="am-eyebrow mb-6" style={{ color: 'var(--am-purple-light)' }}>
            How it works
          </p>
          <ul className="space-y-5">
            {[
              { n: '1', t: 'Live, small-group classes', d: 'Scheduled sessions with an experienced teacher — not pre-recorded videos.' },
              { n: '2', t: 'A curriculum that runs ahead', d: 'Indian-curriculum math & coding, two to three years ahead of grade level.' },
              { n: '3', t: 'Everything in one place', d: 'Schedule, calendar sync, and class recordings on your dashboard.' },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span
                  className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}
                >
                  {s.n}
                </span>
                <div>
                  <div className="text-white font-semibold text-[0.95rem]">{s.t}</div>
                  <div className="text-white/60 text-sm mt-0.5 leading-relaxed">{s.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-white/45 text-xs">
          © 2026 AcademyMinds
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--am-navy)' }}>
              Academy<span style={{ color: 'var(--am-purple)' }}>Minds</span>
            </Link>
          </div>

          <h1 className="am-heading text-3xl mb-2" style={{ color: 'var(--am-navy)' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-[var(--am-ink-500)] text-sm mb-8">
            {isSignUp
              ? 'Start your free trial — no credit card required.'
              : 'Sign in to access your dashboard.'}
          </p>

          {resetOk && !isSignUp && (
            <div className="mb-5 text-sm p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d' }}>
              Password updated — sign in with your new password.
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            {isSignUp && (
              <>
                <input type="hidden" name="accountType" value={accountType} />

                {/* Account type toggle */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">I&apos;m signing up as</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(['parent', 'student'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAccountType(t)}
                        className="py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200"
                        style={
                          accountType === t
                            ? { background: 'var(--am-purple)', color: 'white', boxShadow: '0 8px 20px -6px rgba(118,75,162,0.5)' }
                            : { background: 'rgba(118,75,162,0.06)', color: 'var(--am-purple)', border: '1px solid rgba(118,75,162,0.15)' }
                        }
                      >
                        {t === 'parent' ? '👨‍👩‍👧 Parent' : '🎓 Student'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    {accountType === 'parent' ? 'Parent name' : 'Your name'}
                  </Label>
                  <Input id="name" name="name" type="text" placeholder="Your full name" required className="mt-1" />
                </div>

                {accountType === 'parent' && (
                  <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(118,75,162,0.04)', border: '1px solid rgba(118,75,162,0.12)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">About your child</p>
                    <div>
                      <Label htmlFor="childName" className="text-sm font-medium text-gray-700">Child&apos;s name</Label>
                      <Input id="childName" name="childName" type="text" placeholder="Child's full name" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="childGrade" className="text-sm font-medium text-gray-700">Grade</Label>
                        <select
                          id="childGrade"
                          name="childGrade"
                          defaultValue="6"
                          className="am-input mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none transition-shadow"
                          style={{ borderColor: 'var(--am-hairline-strong)' }}
                        >
                          <option value="5">Grade 5</option>
                          <option value="6">Grade 6</option>
                          <option value="7">Grade 7</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="subjectInterest" className="text-sm font-medium text-gray-700">Interest</Label>
                        <select
                          id="subjectInterest"
                          name="subjectInterest"
                          defaultValue="both"
                          className="am-input mt-1 w-full px-3 py-2 rounded-lg border text-sm outline-none transition-shadow"
                          style={{ borderColor: 'var(--am-hairline-strong)' }}
                        >
                          <option value="math">Math</option>
                          <option value="coding">Coding</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                {!isSignUp && (
                  <Link href="/forgot-password" className="text-xs" style={{ color: 'var(--am-purple)' }}>Forgot password?</Link>
                )}
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="mt-1" />
            </div>

            {isSignUp && (
              <label className="flex items-start gap-2.5 text-xs text-[var(--am-ink-500)] leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--am-purple)]"
                />
                <span>
                  I&apos;m the parent or legal guardian, and I agree to the{' '}
                  <Link href="/terms" target="_blank" className="underline" style={{ color: 'var(--am-purple)' }}>Terms</Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="underline" style={{ color: 'var(--am-purple)' }}>Privacy Policy</Link>,
                  including collecting my child&apos;s information.
                </span>
              </label>
            )}

            {state?.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="am-btn am-btn-primary w-full text-base h-auto"
            >
              {pending ? 'Please wait...' : isSignUp ? 'Create Account & Start Free Trial' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            {isSignUp ? (
              <>Already have an account?{' '}
                <Link href="/sign-in" style={{ color: 'var(--am-purple)' }} className="font-semibold">Sign in</Link>
              </>
            ) : (
              <>New to AcademyMinds?{' '}
                <Link href="/sign-up" style={{ color: 'var(--am-purple)' }} className="font-semibold">Enroll your child →</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
