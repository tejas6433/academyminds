const TEACHERS = [
  {
    name: 'Mr. Rajan Sharma',
    subject: 'Mathematics',
    qual: 'M.Sc Mathematics, IIT Delhi',
    exp: '12 years',
    bio: 'Specialized in making abstract math concepts intuitive for young learners. Trained 500+ students through CBSE curriculum.',
    initials: 'RS',
  },
  {
    name: 'Ms. Priya Nair',
    subject: 'Coding & Python',
    qual: 'B.Tech Computer Science, NIT',
    exp: '8 years',
    bio: 'Former software engineer turned educator. Believes every child can code. Makes Python fun through real mini-projects.',
    initials: 'PN',
  },
];

export function Teachers() {
  return (
    <section id="teachers" className="am-glow-top relative py-28 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>The People Behind It</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Meet Your Teachers
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg am-measure mx-auto">
            Verified Indian educators with deep subject mastery and a passion for teaching young minds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {TEACHERS.map((t) => (
            <div
              key={t.name}
              className="am-card am-card-hover p-8"
            >
              <div className="flex items-center gap-5 mb-6">
                {/* Avatar placeholder */}
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: 'var(--am-gradient)', boxShadow: '0 10px 24px -10px rgba(118,75,162,0.6)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight" style={{ color: 'var(--am-navy)' }}>{t.name}</h3>
                  <div className="text-sm font-medium" style={{ color: 'var(--am-purple)' }}>{t.subject}</div>
                  <div
                    className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(118,75,162,0.09)', color: 'var(--am-purple)' }}
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.5 2.1 3.2-.4.7 3.2 2.8 1.7-1.4 2.9 1.4 2.9-2.8 1.7-.7 3.2-3.2-.4L10 19l-2.5-2.1-3.2.4-.7-3.2L.8 12.4l1.4-2.9L.8 6.6l2.8-1.7.7-3.2 3.2.4z" opacity="0.9"/></svg>
                    Verified Indian Educator
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-[var(--am-ink-700)]">
                  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}><path d="M10 3L1 7l9 4 7.5-3.3V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10.5V14c0 1.1 2.2 2 5 2s5-.9 5-2v-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  {t.qual}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[var(--am-ink-700)]">
                  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}><circle cx="10" cy="10" r="7.3" stroke="currentColor" strokeWidth="1.6"/><path d="M10 6v4.2l2.6 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {t.exp} teaching experience
                </div>
              </div>

              <p className="text-[var(--am-ink-500)] text-sm leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
