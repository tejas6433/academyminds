'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const GRADES = [5, 6, 7] as const;
const SUBJECTS = ['Math', 'Coding', 'Both'] as const;

const inputCls = 'am-input w-full px-4 py-3 rounded-[var(--am-radius-input)] border bg-white outline-none transition-shadow text-[var(--am-ink-900)]';
const inputStyle = { borderColor: 'var(--am-hairline-strong)' } as const;

function Choice({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex-1 py-3 rounded-[var(--am-radius-input)] font-semibold text-sm transition-colors duration-150"
      style={
        active
          ? { background: 'var(--am-purple)', color: '#fff' }
          : { background: 'var(--am-surface-sunken)', color: 'var(--am-ink-700)', border: '1px solid var(--am-hairline)' }
      }
    >
      {children}
    </button>
  );
}

export default function EnquiryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState<number | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: form.get('parentName'),
          email: form.get('email'),
          grade: grade ?? undefined,
          interest: subject ? subject.toLowerCase() : undefined,
          message: form.get('message') || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      <Navbar />

      <section className="pt-28 pb-24 px-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>
              Book a free trial
            </p>
            <h1 className="am-display text-3xl sm:text-4xl mb-3" style={{ color: 'var(--am-navy)' }}>
              Tell us about your child
            </h1>
            <p className="text-[var(--am-ink-500)] text-lg leading-relaxed">
              A few details and we&apos;ll reach out to set up a trial class and answer your questions.
            </p>
          </div>

          {submitted ? (
            <div className="am-card p-10 text-center">
              <div
                className="mx-auto mb-5 h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(118,75,162,0.1)' }}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="var(--am-purple)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="am-heading text-2xl mb-2" style={{ color: 'var(--am-navy)' }}>
                Thanks — we&apos;ve got it
              </h2>
              <p className="text-[var(--am-ink-500)]">
                We&apos;ll reach out within one business day to set up your child&apos;s trial class.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="am-card p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--am-navy)' }}>Parent name</label>
                  <input required name="parentName" type="text" placeholder="Your full name" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--am-navy)' }}>Email address</label>
                  <input required name="email" type="email" placeholder="you@example.com" className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--am-navy)' }}>Child&apos;s grade</label>
                <div className="flex gap-3">
                  {GRADES.map((g) => (
                    <Choice key={g} active={grade === g} onClick={() => setGrade(g)}>Grade {g}</Choice>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--am-navy)' }}>
                  Most excited about <span className="font-normal text-[var(--am-ink-400)]">(classes cover both)</span>
                </label>
                <div className="flex gap-3">
                  {SUBJECTS.map((s) => (
                    <Choice key={s} active={subject === s} onClick={() => setSubject(s)}>{s}</Choice>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--am-navy)' }}>
                  Message <span className="font-normal text-[var(--am-ink-400)]">(optional)</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Anything that helps — interests, schedule preferences, questions."
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                />
              </div>

              {error && (
                <p className="text-sm font-medium" style={{ color: '#dc2626' }} role="alert">{error}</p>
              )}

              <button type="submit" disabled={submitting} className="am-btn am-btn-primary w-full text-base disabled:opacity-60">
                {submitting ? 'Sending…' : 'Send enquiry'}
              </button>

              <p className="text-center text-[var(--am-ink-400)] text-xs">
                No payment required — we&apos;ll walk you through the program first.
              </p>
            </form>
          )}

          <p className="text-center text-[var(--am-ink-400)] text-sm mt-8">
            Ready to enroll now?{' '}
            <a href="/payment" className="font-medium underline" style={{ color: 'var(--am-purple)' }}>
              Pay &amp; enroll directly
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
