import { COURSES, type Grade } from '@/lib/content/curriculum';

interface CoursesProps {
  selectedGrade: Grade;
}

export function Courses({ selectedGrade }: CoursesProps) {
  const entry = COURSES[selectedGrade];
  const courses = [
    { ...entry.math, color: 'var(--am-purple)' },
    { ...entry.coding, color: 'var(--am-navy)' },
  ];

  return (
    <section id="courses" className="am-glow-top relative py-28 px-4 sm:px-6 bg-white">
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>What They'll Learn</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Grade {selectedGrade} <span className="am-text-gradient-purple">Curriculum</span>
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg">Live classes, real teachers, real results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {courses.map((c, idx) => {
            const headerBg = idx % 2 === 0
              ? 'linear-gradient(135deg, var(--am-purple) 0%, var(--am-purple-dark) 100%)'
              : 'linear-gradient(135deg, #232347 0%, var(--am-navy) 100%)';
            return (
            <div
              key={c.subject}
              className="am-card am-card-hover overflow-hidden flex flex-col"
            >
              {/* Card header */}
              <div className="relative p-7 overflow-hidden" style={{ background: headerBg }}>
                <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div
                  className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl mb-4"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}
                >
                  {c.icon}
                </div>
                <h3 className="relative text-xl font-bold text-white tracking-tight">{c.subject}</h3>
                <div className="relative text-white/70 text-sm mt-1.5">
                  <span className="text-white font-medium">{c.frequency}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-7 flex-1 flex flex-col">
                <ul className="space-y-2.5 mb-7 flex-1">
                  {c.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[var(--am-ink-700)] text-sm">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}>
                        <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
                <a
                  href="/enquiry"
                  className="am-btn am-btn-primary w-full text-sm"
                >
                  Enroll in this course
                </a>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
