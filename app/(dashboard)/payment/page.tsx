'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$99',
    period: 'CAD/mo',
    billed: 'Billed $99 monthly',
    desc: 'Flexible month-to-month. Cancel anytime.',
    highlight: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '$79',
    period: 'CAD/mo',
    billed: 'Billed $237 every 3 months',
    desc: 'Best value — a lower monthly rate, billed every 3 months.',
    highlight: true,
  },
];

export default function PaymentPage() {
  const [plan, setPlan] = useState('quarterly');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main>
      <Navbar />
      <section id="main-content" tabIndex={-1} className="am-glow-top relative py-24 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>Secure Checkout</p>
            <h1 className="am-heading text-3xl sm:text-4xl mb-3" style={{ color: 'var(--am-navy)' }}>
              Enroll &amp; Pay Securely
            </h1>
            <p className="text-[var(--am-ink-500)] text-lg">
              Pick a plan and check out with Stripe — no enquiry needed. Cancel or change plans anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className="am-card-hover text-left rounded-[1.25rem] p-6"
                style={{
                  background: 'white',
                  border: plan === p.id ? '1px solid var(--am-purple)' : '1px solid var(--am-hairline)',
                  boxShadow: plan === p.id ? 'var(--am-shadow-lg)' : 'var(--am-shadow-sm)',
                }}
              >
                {p.highlight && (
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full mb-3"
                    style={{ background: 'var(--am-purple)' }}
                  >
                    Most Popular
                  </span>
                )}
                <div className="font-extrabold text-xl mb-1" style={{ color: 'var(--am-navy)' }}>
                  {p.name}
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--am-purple)' }}>{p.price}</span>
                  <span className="text-[var(--am-ink-400)] mb-1 text-sm font-medium">{p.period}</span>
                </div>
                <p className="text-[var(--am-ink-400)] text-xs mt-1 mb-2">{p.billed}</p>
                <p className="text-gray-500 text-sm">{p.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: plan === p.id ? 'var(--am-purple)' : '#9ca3af' }}>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ border: `2px solid ${plan === p.id ? 'var(--am-purple)' : '#d1d5db'}` }}
                  >
                    {plan === p.id && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--am-purple)' }} />}
                  </span>
                  {plan === p.id ? 'Selected' : 'Select plan'}
                </div>
              </button>
            ))}
          </div>

          <div className="am-card-raised rounded-[1.25rem] p-8">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--am-navy)' }}>
              Email for receipt &amp; account
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="am-input w-full px-4 py-3 rounded-lg border outline-none transition-shadow mb-4"
              style={{ borderColor: 'var(--am-hairline-strong)' }}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="button"
              disabled={loading}
              onClick={handleCheckout}
              className="am-btn am-btn-primary w-full text-base disabled:opacity-60"
            >
              {loading ? 'Redirecting to checkout…' : 'Continue to secure checkout'}
            </button>

            <p className="text-center text-[var(--am-ink-400)] text-xs mt-4">
              Prices in CAD, all-inclusive — no extra tax. Secured by Stripe — cancel anytime.
            </p>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Prefer to talk first? <a href="/enquiry" className="underline font-medium" style={{ color: 'var(--am-purple)' }}>Send us an enquiry</a> instead.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
