// components/landing/founding-families.tsx
const BENEFITS = [
  { title: 'Small cohort', desc: 'Few students per class, so teaching stays close and personal.' },
  { title: 'Direct teacher access', desc: 'Priority booking and quick answers between sessions.' },
  { title: 'A say in the program', desc: 'Early families help shape what we teach and when.' },
];

export function FoundingFamilies() {
  return (
    <section className="am-grain relative py-28 px-6" style={{ background: 'var(--am-navy)' }}>
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple-light)' }}>
          Now enrolling — first cohort
        </p>
        <h2 className="am-heading text-3xl sm:text-[2.5rem] text-white mb-5">
          Join our founding families
        </h2>
        <p className="text-gray-300/85 text-lg mb-12 am-measure mx-auto leading-relaxed">
          We&apos;re starting with a deliberately small group so every student gets real
          attention. Early families get the closest access — and a hand in how the
          program grows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="text-white font-semibold mb-1.5">{b.title}</div>
              <div className="text-gray-400 text-sm leading-relaxed">{b.desc}</div>
            </div>
          ))}
        </div>

        <a href="/enquiry" className="am-btn am-btn-primary px-9">
          Book a free trial class
        </a>
      </div>
    </section>
  );
}
