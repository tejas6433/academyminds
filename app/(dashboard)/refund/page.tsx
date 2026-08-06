// app/(dashboard)/refund/page.tsx
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'How cancellations and refunds work for AcademyMinds subscriptions.',
};

const UPDATED = 'August 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="am-heading text-xl mb-2" style={{ color: 'var(--am-navy)' }}>{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function RefundPage() {
  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      <Navbar />
      <article id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>Legal</p>
        <h1 className="am-display text-4xl mb-2" style={{ color: 'var(--am-navy)' }}>Refund &amp; Cancellation Policy</h1>
        <p className="text-[var(--am-ink-400)] text-sm mb-8">Last updated: {UPDATED}</p>

        <div className="space-y-6 text-[var(--am-ink-700)] leading-relaxed">
          <p>We want families to feel confident enrolling. This policy explains how cancellations and
            refunds work for AcademyMinds subscriptions.</p>

          <Section title="Free trial">
            <p>Every family can book a free trial class with no credit card required. You only pay once you
              choose to subscribe, so you can experience a real class before committing.</p>
          </Section>

          <Section title="Cancelling your subscription">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You can cancel anytime — there are no cancellation fees and no lock-in.</li>
              <li>After you cancel, your child keeps full access until the end of the period you already
                paid for. Billing simply stops renewing.</li>
              <li>To cancel, email <a href="mailto:support@academyminds.com" className="underline" style={{ color: 'var(--am-purple)' }}>support@academyminds.com</a> and we&apos;ll process it promptly.</li>
            </ul>
          </Section>

          <Section title="Refunds">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Monthly plan:</strong> if you&apos;re not satisfied, contact us within 7 days of a
                charge and we&apos;ll refund that month, provided your child has attended no more than one
                live class in the period.</li>
              <li><strong>Quarterly plan:</strong> if you cancel within 7 days of the start of a new
                3-month term, we&apos;ll refund the unused portion of that term.</li>
              <li>Partial months already used are non-refundable, but access always continues to the end of
                the paid period.</li>
              <li>Refunds are issued to the original payment method through Stripe and typically appear
                within 5–10 business days.</li>
            </ul>
          </Section>

          <Section title="Exceptional circumstances">
            <p>If a technical problem on our side prevents your child from attending classes, contact us and
              we&apos;ll make it right — including a pro-rated credit or refund where appropriate.</p>
          </Section>

          <Section title="Questions">
            <p>Reach us any time at <a href="mailto:support@academyminds.com" className="underline" style={{ color: 'var(--am-purple)' }}>support@academyminds.com</a>.</p>
          </Section>
        </div>
      </article>
      <Footer />
    </main>
  );
}
