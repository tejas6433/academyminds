// components/landing/local-story.tsx
// The trust section: who is behind this, and why a BC family should believe
// them. Deliberately placed before pricing — parents decide whether they trust
// you before they look at what it costs.
export function LocalStory() {
  return (
    <section id="our-story" className="relative py-28 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>Our Story</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Built in British Columbia, <span className="am-text-gradient-purple">for BC families</span>
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg am-measure-wide mx-auto leading-relaxed">
            We are a small, independent, BC-owned and operated tutoring company — not a
            franchise, not an overseas call centre, not an app. Real teachers, small
            groups, and a founder you can actually reach.
          </p>
        </div>

        {/* Founder note */}
        <div className="am-card-raised p-8 sm:p-10 mb-12 max-w-3xl mx-auto">
          <div className="flex items-start gap-5">
            <span
              className="shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--am-purple) 0%, var(--am-purple-dark) 100%)' }}
              aria-hidden
            >
              AM
            </span>
            <div>
              <p className="text-[var(--am-ink-700)] leading-relaxed mb-4">
                &ldquo;I started AcademyMinds because I kept meeting bright kids who were
                doing fine in math class and still had no real foundation underneath it.
                Fine is not the same as ready. The next decade belongs to people who
                understand the mathematics behind AI — and that understanding does not
                start in university. It starts now, in Grade 5, 6 and 7.
              </p>
              <p className="text-[var(--am-ink-700)] leading-relaxed mb-5">
                So we keep the groups small, we mark every single assignment ourselves,
                and we do not move on until a student is genuinely solid. If your child
                is in one of our classes, I know their name and I know how they are
                doing.&rdquo;
              </p>
              <div className="text-sm">
                <div className="font-bold" style={{ color: 'var(--am-navy)' }}>Founder, AcademyMinds</div>
                <div className="text-[var(--am-ink-400)]">British Columbia, Canada</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: '🍁',
              title: 'Local and accountable',
              body: 'BC owned and operated. You are dealing with the people who actually run the classes, on your timezone, not a support ticket.',
            },
            {
              icon: '✍️',
              title: 'Every assignment marked',
              body: 'Three assignments a week, each one read and returned with feedback by a real teacher. Nothing is auto-graded and forgotten.',
            },
            {
              icon: '👥',
              title: 'Small enough to notice',
              body: 'Cohorts of 10–12. Small enough that we spot a struggling student in week two, not at report-card time.',
            },
          ].map((p) => (
            <div key={p.title} className="am-card p-7">
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl mb-4"
                style={{ background: 'rgba(118,75,162,0.1)' }}
                aria-hidden
              >
                {p.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--am-navy)' }}>{p.title}</h3>
              <p className="text-sm text-[var(--am-ink-600)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
