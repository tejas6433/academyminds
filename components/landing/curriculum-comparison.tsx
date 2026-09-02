'use client';

import { CURRICULUM_DATA, type Grade } from '@/lib/content/curriculum';

interface CurriculumComparisonProps {
  selectedGrade: Grade;
  onGradeChange: (g: Grade) => void;
}

export function CurriculumComparison({ selectedGrade, onGradeChange }: CurriculumComparisonProps) {
  const rows = CURRICULUM_DATA[selectedGrade];

  return (
    <section
      id="curriculum"
      className="am-grain relative py-28 px-4 sm:px-6"
      style={{ background: 'var(--am-gradient)' }}
    >
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="am-eyebrow mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>The curriculum gap</p>
          <h2 className="am-heading text-3xl sm:text-[2.5rem] text-white mb-5">
            What your child covers here — and how much deeper it goes
          </h2>
          <p className="text-purple-100/85 text-lg am-measure-wide mx-auto leading-relaxed">
            We follow the ICSE sequence, which goes deeper and moves faster than a typical BC classroom — so your child builds real fluency, not just familiarity.
          </p>
        </div>

        {/* Grade tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)' }}>
            {([5, 6, 7] as Grade[]).map((g) => (
              <button
                key={g}
                onClick={() => onGradeChange(g)}
                className="px-6 py-2 rounded-full font-bold text-sm transition-all duration-200"
                style={
                  selectedGrade === g
                    ? { background: '#fff', color: 'var(--am-navy)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.78)' }
                }
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table — scrolls horizontally on small screens instead of cramming */}
        <div className="overflow-x-auto rounded-[1.25rem]" style={{ boxShadow: 'var(--am-shadow-xl)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="min-w-[680px]">
            {/* Header */}
            <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr_0.9fr] text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)' }}>
              <div className="px-4 py-3.5">Topic</div>
              <div className="px-4 py-3.5">Typical BC Grade Level</div>
              <div className="px-4 py-3.5">At AcademyMinds</div>
              <div className="px-4 py-3.5 text-center">Our Edge</div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.topic}
                className="grid grid-cols-[1.1fr_1.4fr_1.4fr_0.9fr] border-t border-white/10 animate-slide-in"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div className="px-4 py-4 text-white font-semibold text-sm self-center">{row.topic}</div>
                <div className="px-4 py-4 text-red-200/90 text-sm self-center">{row.typical}</div>
                <div className="px-4 py-4 text-emerald-200 text-sm font-medium self-center">{row.ours} ✓</div>
                <div className="px-4 py-4 text-center self-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.28)' }}
                  >
                    {row.advantage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {['BC Owned & Operated', 'ICSE-Trained Educators', 'Small Live Cohorts'].map((b) => (
            <div
              key={b}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ✓ {b}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#courses"
            className="am-btn px-8"
            style={{ background: '#fff', color: 'var(--am-purple)' }}
          >
            See Grade {selectedGrade} courses
          </a>
        </div>
      </div>
    </section>
  );
}
