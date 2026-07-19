// app/(dashboard)/terms/page.tsx
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = { title: 'Terms of Service — AcademyMinds' };

const UPDATED = 'July 2026';

export default function TermsPage() {
  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      <Navbar />
      <article className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>Legal</p>
        <h1 className="am-display text-4xl mb-2" style={{ color: 'var(--am-navy)' }}>Terms of Service</h1>
        <p className="text-[var(--am-ink-400)] text-sm mb-8">Last updated: {UPDATED}</p>

        <div className="space-y-6 text-[var(--am-ink-700)] leading-relaxed">
          <p>These terms govern your use of AcademyMinds. By creating an account, you agree to them.</p>

          <Section title="Who can use AcademyMinds">
            <p>Accounts must be created by a parent or legal guardian aged 18+. The guardian is responsible
              for their child&apos;s use of the service.</p>
          </Section>

          <Section title="The service">
            <p>We provide scheduled live online classes in math and coding for Grades 5–7, along with
              recordings and a schedule dashboard. Class times, teachers, and curriculum may change.</p>
          </Section>

          <Section title="Payments &amp; billing">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Plans are billed in advance in Canadian dollars through Stripe.</li>
              <li>Monthly: $99.99/month. Quarterly: $79.99/month, billed $239.97 every 3 months.</li>
              <li>Subscriptions renew automatically until cancelled. You can cancel anytime; access
                continues to the end of the paid period.</li>
              <li>Free trial: one day, no card required.</li>
            </ul>
          </Section>

          <Section title="Refunds">
            <p>If something goes wrong, contact us. We handle refund requests fairly and case by case;
              unused, recently billed periods are generally refundable.</p>
          </Section>

          <Section title="Acceptable use">
            <p>Don&apos;t share account access, disrupt classes, record or redistribute sessions without
              permission, or misuse the platform. We may suspend accounts that break these rules.</p>
          </Section>

          <Section title="Your content &amp; conduct">
            <p>You&apos;re responsible for the accuracy of the information you provide and for your child&apos;s
              conduct in class.</p>
          </Section>

          <Section title="Availability">
            <p>We aim for reliable service but don&apos;t guarantee uninterrupted access. Occasional
              maintenance or outages may occur.</p>
          </Section>

          <Section title="Liability">
            <p>To the extent permitted by law, AcademyMinds isn&apos;t liable for indirect or consequential
              damages. Our total liability is limited to the amount you paid in the prior three months.</p>
          </Section>

          <Section title="Governing law">
            <p>These terms are governed by the laws of British Columbia, Canada.</p>
          </Section>

          <Section title="Contact">
            <p>Questions: <a href="mailto:support@academyminds.com" className="underline" style={{ color: 'var(--am-purple)' }}>support@academyminds.com</a>.</p>
          </Section>

          <p className="text-xs text-[var(--am-ink-400)] border-t border-gray-200 pt-6">
            This is a baseline agreement and should be reviewed by legal counsel before launch.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="am-heading text-xl mb-2" style={{ color: 'var(--am-navy)' }}>{title}</h2>
      {children}
    </section>
  );
}
