// components/landing/pricing.tsx
const PLANS = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '1 day free',
    billingNote: 'No card required',
    description: 'No credit card. Try a real live class today.',
    features: [
      'Full access for 1 day',
      'Live class with a real teacher',
      'Math or Coding — your choice',
      'No commitment, cancel anytime',
    ],
    cta: 'Start Free Trial',
    href: '/enquiry',
    highlight: false,
    badge: null as string | null,
  },
  {
    name: 'Monthly',
    price: '$99.99',
    period: 'CAD/mo',
    billingNote: 'Billed monthly · cancel anytime',
    description: 'Flexible month-to-month. Cancel anytime.',
    features: [
      'Unlimited live classes',
      'Math + Coding access',
      'Class recordings',
      'Progress reports',
      'Calendar sync (Google, Apple, Outlook)',
      'Direct teacher Q&A',
    ],
    cta: 'Enroll Now',
    href: '/enquiry',
    highlight: false,
    badge: null as string | null,
  },
  {
    name: 'Quarterly',
    price: '$79.99',
    period: 'CAD/mo',
    billingNote: 'Billed $239.97 every 3 months',
    description: 'Best value — a lower monthly rate, billed every 3 months.',
    features: [
      'Unlimited live classes',
      'Math + Coding access',
      'Class recordings',
      'Progress reports',
      'Calendar sync (Google, Apple, Outlook)',
      'Priority class slots',
      'Direct teacher Q&A',
    ],
    cta: 'Enroll Now',
    href: '/enquiry',
    highlight: true,
    badge: 'Most Popular' as string | null,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="am-glow-top relative py-28 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>Pricing</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Simple, Transparent <span className="am-text-gradient-purple">Pricing</span>
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg">
            Start free. All class schedules sync to your phone calendar automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`am-card-hover rounded-[1.25rem] overflow-hidden flex flex-col ${plan.highlight ? 'sm:scale-[1.05] sm:-my-2 relative z-10' : ''}`}
              style={
                plan.highlight
                  ? { border: '1px solid var(--am-purple)', background: 'white', boxShadow: 'var(--am-shadow-xl)' }
                  : { border: '1px solid var(--am-hairline)', background: 'white', boxShadow: 'var(--am-shadow-sm)' }
              }
            >
              {plan.badge && (
                <div
                  className="py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-white"
                  style={{ background: 'linear-gradient(135deg, var(--am-purple) 0%, var(--am-purple-dark) 100%)' }}
                >
                  {plan.badge}
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-extrabold text-2xl mb-2 tracking-tight" style={{ color: 'var(--am-navy)' }}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1.5">
                  <span className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--am-purple)' }}>
                    {plan.price}
                  </span>
                  <span className="text-[var(--am-ink-400)] mb-2 text-sm font-medium">{plan.period}</span>
                </div>
                <p className="text-[var(--am-ink-400)] text-xs mt-1.5 mb-5">{plan.billingNote}</p>
                <p className="text-[var(--am-ink-500)] text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--am-ink-700)]">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}>
                        <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  className={`am-btn w-full text-base ${plan.highlight ? 'am-btn-primary' : ''}`}
                  style={
                    plan.highlight
                      ? undefined
                      : { border: '1.5px solid var(--am-purple)', color: 'var(--am-purple)', background: 'white' }
                  }
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-10">
          Ready to skip the wait? <a href="/payment" className="underline font-medium" style={{ color: 'var(--am-purple)' }}>Pay &amp; enroll directly</a> — secure checkout via Stripe.
          <br />
          Have questions first? <a href="/enquiry" className="underline font-medium" style={{ color: 'var(--am-purple)' }}>Send us an enquiry</a> and we'll reach out.
        </p>
      </div>
    </section>
  );
}
