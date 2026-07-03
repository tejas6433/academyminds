import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function PaymentSuccessPage() {
  return (
    <main>
      <Navbar />
      <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
        <div className="am-card-raised max-w-xl mx-auto p-10 text-center">
          <div
            className="mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(118,75,162,0.1)' }}
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="var(--am-purple)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="am-heading text-3xl mb-2" style={{ color: 'var(--am-navy)' }}>
            You&apos;re enrolled
          </h1>
          <p className="text-[var(--am-ink-500)] mb-6 leading-relaxed">
            Payment received. Our team will email you shortly with login details and your child&apos;s class schedule.
          </p>
          <a href="/" className="am-btn am-btn-primary px-8">
            Back to home
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
