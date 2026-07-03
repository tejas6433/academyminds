'use client';

type Grade = 5 | 6 | 7;

const CURRICULUM_DATA: Record<Grade, { topic: string; canadian: string; indian: string; advantage: string }[]> = {
  5: [
    { topic: 'Fractions & Decimals', canadian: 'Basic fractions, Grade 5', indian: 'Advanced operations + ratios ✓', advantage: '+1.5 years' },
    { topic: 'Algebra Concepts', canadian: 'Not introduced until Grade 7', indian: 'Variables & expressions ✓', advantage: '+2 years' },
    { topic: 'Geometry', canadian: 'Basic shapes', indian: 'Area, perimeter, coordinate grids ✓', advantage: '+1 year' },
    { topic: 'Coding / Logic', canadian: 'Scratch (visual blocks)', indian: 'Python fundamentals ✓', advantage: '+3 years' },
    { topic: 'Problem-Solving', canadian: 'Word problems, basic', indian: 'Multi-step logical reasoning ✓', advantage: '+2 years' },
  ],
  6: [
    { topic: 'Algebra', canadian: 'Not introduced until Grade 8', indian: 'Full chapter: equations & expressions ✓', advantage: '+2 years' },
    { topic: 'Fractions Mastery', canadian: 'Basic operations, Grade 6', indian: 'Complex fractions + ratios ✓', advantage: '+1.5 years' },
    { topic: 'Data & Statistics', canadian: 'Not until Grade 8', indian: 'Mean, median, mode, graphs ✓', advantage: '+2 years' },
    { topic: 'Coding', canadian: 'Scratch / basic HTML', indian: 'Python: loops, functions, logic ✓', advantage: '+3 years' },
    { topic: 'Number Theory', canadian: 'LCM/GCF Grade 7', indian: 'Primes, factors, divisibility rules ✓', advantage: '+1 year' },
  ],
  7: [
    { topic: 'Algebra', canadian: 'Intro algebra, Grade 8', indian: 'Linear equations, inequalities ✓', advantage: '+1 year' },
    { topic: 'Geometry Proofs', canadian: 'Not until Grade 9', indian: 'Triangle properties, congruence ✓', advantage: '+2 years' },
    { topic: 'Percentages & Interest', canadian: 'Grade 8–9', indian: 'Full financial math ✓', advantage: '+1.5 years' },
    { topic: 'Python Coding', canadian: 'Grade 9+ elective', indian: 'Functions, lists, mini-projects ✓', advantage: '+2 years' },
    { topic: 'Exponents & Powers', canadian: 'Grade 9', indian: 'Laws of exponents ✓', advantage: '+2 years' },
  ],
};

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
            Where your child is today — and where they&apos;ll be with us
          </h2>
          <p className="text-purple-100/85 text-lg am-measure-wide mx-auto leading-relaxed">
            The Indian curriculum covers the same material two to three years earlier. It&apos;s documented in both the Ontario and CBSE/ICSE syllabi.
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
              <div className="px-4 py-3.5">🍁 Canadian Curriculum</div>
              <div className="px-4 py-3.5">🇮🇳 AcademyMinds</div>
              <div className="px-4 py-3.5 text-center">Head Start</div>
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
                <div className="px-4 py-4 text-red-200/90 text-sm self-center">{row.canadian}</div>
                <div className="px-4 py-4 text-emerald-200 text-sm font-medium self-center">{row.indian}</div>
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
          {['CBSE Certified Teachers', 'ICSE Trained Educators', 'Ontario Curriculum Mapped'].map((b) => (
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
