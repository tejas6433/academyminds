'use client';

import Link from 'next/link';

const GRADES = [5, 6, 7] as const;
type Grade = (typeof GRADES)[number];

// Factual curriculum sequencing — when each topic is introduced, not invented metrics.
const GAP_ROWS = [
  { topic: 'Algebra', canada: 'Grade 8', am: 'Grade 6' },
  { topic: 'Python basics', canada: 'Grade 9', am: 'Grade 6' },
  { topic: 'Geometry proofs', canada: 'Grade 9', am: 'Grade 7' },
];

interface HeroProps {
  onGradeChange: (grade: Grade) => void;
  selectedGrade: Grade;
}

export function Hero({ onGradeChange, selectedGrade }: HeroProps) {
  return (
    <section
      className="am-grain relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28"
      style={{ background: 'var(--am-gradient-dark)' }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        {/* Left — message */}
        <div>
          <p className="am-eyebrow mb-5" style={{ color: 'var(--am-purple-light)' }}>
            Live classes · Grade 5–7
          </p>

          <h1 className="am-display text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[3.5rem] text-white mb-6">
            Math &amp; coding that puts your child two grades ahead.
          </h1>

          <p className="text-lg text-gray-300/90 am-measure-wide mb-8 leading-relaxed">
            Small live classes for Grade 5–7, taught on the Indian curriculum —
            which introduces algebra, geometry, and coding two to three years
            earlier than Canadian schools.
          </p>

          {/* Grade selector */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-gray-400 text-sm">Your child&apos;s grade</span>
            <div
              className="inline-flex gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              role="group"
              aria-label="Select your child's grade"
            >
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => onGradeChange(g)}
                  aria-pressed={selectedGrade === g}
                  className="px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors duration-200"
                  style={
                    selectedGrade === g
                      ? { background: '#fff', color: 'var(--am-navy)' }
                      : { background: 'transparent', color: 'rgba(255,255,255,0.7)' }
                  }
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/enquiry" className="am-btn am-btn-primary px-7">
              Book a free trial class
            </Link>
            <a
              href="#curriculum"
              className="am-btn px-7 text-white"
              style={{ border: '1px solid rgba(255,255,255,0.24)', background: 'rgba(255,255,255,0.04)' }}
            >
              See the curriculum gap
            </a>
          </div>
        </div>

        {/* Right — factual proof card */}
        <div className="lg:justify-self-end w-full max-w-md">
          <div
            className="rounded-2xl p-6 sm:p-7"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 24px 60px -24px rgba(0,0,0,0.6)',
            }}
          >
            <p className="am-eyebrow mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              When it&apos;s taught
            </p>

            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-sm">
              <div className="text-gray-400 pb-3">Topic</div>
              <div className="text-gray-400 pb-3 text-right">Canada</div>
              <div className="pb-3 text-right font-semibold" style={{ color: 'var(--am-purple-light)' }}>Here</div>

              {GAP_ROWS.map((r, i) => (
                <div key={r.topic} className="contents">
                  <div
                    className="py-3 text-white font-medium"
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {r.topic}
                  </div>
                  <div
                    className="py-3 text-right text-gray-400"
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {r.canada}
                  </div>
                  <div
                    className="py-3 text-right font-semibold text-white"
                    style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.08)' } : undefined}
                  >
                    {r.am}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-5 leading-relaxed">
              Based on standard CBSE/ICSE vs. Ontario curriculum sequencing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
