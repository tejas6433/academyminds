// app/(dashboard)/privacy/page.tsx
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = { title: 'Privacy Policy — AcademyMinds' };

const UPDATED = 'July 2026';

export default function PrivacyPage() {
  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      <Navbar />
      <article id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <p className="am-eyebrow mb-3" style={{ color: 'var(--am-purple)' }}>Legal</p>
        <h1 className="am-display text-4xl mb-2" style={{ color: 'var(--am-navy)' }}>Privacy Policy</h1>
        <p className="text-[var(--am-ink-400)] text-sm mb-8">Last updated: {UPDATED}</p>

        <div className="prose-am space-y-6 text-[var(--am-ink-700)] leading-relaxed">
          <p>
            AcademyMinds (&quot;we&quot;, &quot;us&quot;) provides live online mathematics classes for
            students in Grades 5–7. This policy explains what personal information we collect, why, and the
            choices you have. We serve families in Canada and follow PIPEDA and BC&apos;s PIPA.
          </p>

          <Section title="Information we collect">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account &amp; parent details:</strong> name, email, password (stored hashed).</li>
              <li><strong>Child details:</strong> first name, grade level, and subject interest, provided by the parent/guardian.</li>
              <li><strong>Class activity:</strong> enrolments, attendance, and access to class recordings.</li>
              <li><strong>Payment details:</strong> handled by Stripe. We never see or store full card numbers.</li>
              <li><strong>Technical data:</strong> IP address and basic logs, used for security and reliability.</li>
            </ul>
          </Section>

          <Section title="Children's information &amp; parental consent">
            <p>
              Accounts are created and consented to by a parent or legal guardian. We collect the minimum
              information needed to deliver classes. We do not sell children&apos;s information or use it for
              advertising. A parent may review, correct, or delete their child&apos;s information at any time.
            </p>
          </Section>

          <Section title="How we use information">
            <p>To run classes, process payments, keep your account secure, provide recordings and progress,
              and communicate about the service. We do not sell personal information.</p>
          </Section>

          <Section title="Who we share it with">
            <p>Only service providers that help us operate: Stripe (payments), our hosting and database
              providers, our email provider, and video/class tooling. Each processes data only on our
              instructions.</p>
          </Section>

          <Section title="Data retention">
            <p>We keep information while your account is active and for a limited period afterward
              (generally up to 2 years) to meet legal and accounting obligations, then delete it.</p>
          </Section>

          <Section title="Your rights">
            <p>You may request access to, correction of, or deletion of your and your child&apos;s
              information, and you may withdraw consent. Email us and we&apos;ll respond promptly.</p>
          </Section>

          <Section title="Security">
            <p>Passwords are hashed, sessions are signed and encrypted, and access to student data is
              restricted by role. No system is perfectly secure, but we take reasonable safeguards.</p>
          </Section>

          <Section title="Contact">
            <p>Privacy questions or requests: <a href="mailto:privacy@academyminds.com" className="underline" style={{ color: 'var(--am-purple)' }}>privacy@academyminds.com</a>.</p>
          </Section>

          <p className="text-xs text-[var(--am-ink-400)] border-t border-gray-200 pt-6">
            This is a baseline policy for a British Columbia–based education service and should be reviewed
            by legal counsel before launch.
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
