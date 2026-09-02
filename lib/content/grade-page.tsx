// lib/content/grade-page.tsx
// Shared body for the three grade-level SEO landing pages (/grade-5-math,
// /grade-6-math, /grade-7-math). Each page.tsx supplies its own metadata and
// JSON-LD (Next.js requires those as file-level exports) and calls this for
// the actual content, so the three pages can't drift out of visual sync while
// still rendering genuinely distinct text and data per grade.
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { CURRICULUM_DATA, COURSES, CLASSES_PER_WEEK, type Grade } from '@/lib/content/curriculum';

interface GradePageProps {
  grade: Grade;
  intro: string;
  faqs: { q: string; a: string }[];
}

const OTHER_GRADES: Record<Grade, Grade[]> = {
  5: [6, 7],
  6: [5, 7],
  7: [5, 6],
};

export function GradeMathPage({ grade, intro, faqs }: GradePageProps) {
  const rows = CURRICULUM_DATA[grade];
  const course = COURSES[grade];
  const base = process.env.BASE_URL || 'https://academyminds.com';

  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      {/* Course schema: makes this page eligible for a rich Course result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: `Grade ${grade} Math — AcademyMinds`,
            description: intro,
            provider: { '@type': 'EducationalOrganization', name: 'AcademyMinds', sameAs: base },
            educationalLevel: `Grade ${grade}`,
            teaches: rows.map((r) => r.topic),
          }),
        }}
      />
      {/* FAQPage schema, generated from the same faqs array rendered below —
          the schema can never drift out of sync with what's visible. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      {/* Breadcrumb: home → Grade N Math */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'AcademyMinds', item: base },
              { '@type': 'ListItem', position: 2, name: `Grade ${grade} Math`, item: `${base}/grade-${grade}-math` },
            ],
          }),
        }}
      />
      <Navbar />
      <article id="main-content" tabIndex={-1}>
        {/* Hero */}
        <section className="am-grain relative py-24 px-4 sm:px-6" style={{ background: 'var(--am-gradient)' }}>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="am-eyebrow mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>Grade {grade} Mathematics</p>
            <h1 className="am-display text-3xl sm:text-5xl text-white mb-5">
              Grade {grade} Math Tutoring — Live Online Classes
            </h1>
            <p className="text-purple-100/85 text-lg leading-relaxed mb-8">{intro}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/enquiry" className="am-btn px-8" style={{ background: '#fff', color: 'var(--am-purple)' }}>
                Book a free trial class
              </Link>
              <Link href="/#pricing" className="am-btn px-8" style={{ border: '1px solid rgba(255,255,255,0.35)', color: '#fff' }}>
                See pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Curriculum gap table */}
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="am-heading text-2xl sm:text-3xl mb-3 text-center" style={{ color: 'var(--am-navy)' }}>
              Grade {grade}: how much further we go
            </h2>
            <p className="text-[var(--am-ink-500)] text-center mb-10 am-measure-wide mx-auto">
              A side-by-side of a typical BC Grade {grade} classroom versus the AcademyMinds
              curriculum — depth and pace, not just topic names.
            </p>
            <div className="overflow-x-auto rounded-[1.25rem]" style={{ boxShadow: 'var(--am-shadow-xl)', border: '1px solid var(--am-hairline-strong)' }}>
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr_0.9fr] text-xs font-bold uppercase tracking-widest"
                  style={{ background: 'var(--am-navy)', color: 'rgba(255,255,255,0.7)' }}>
                  <div className="px-4 py-3.5">Topic</div>
                  <div className="px-4 py-3.5">Typical BC Grade Level</div>
                  <div className="px-4 py-3.5">At AcademyMinds</div>
                  <div className="px-4 py-3.5 text-center">Our Edge</div>
                </div>
                {rows.map((row, i) => (
                  <div key={row.topic} className="grid grid-cols-[1.1fr_1.4fr_1.4fr_0.9fr] border-t"
                    style={{ borderColor: 'var(--am-hairline)', background: i % 2 === 0 ? 'var(--am-bg-light)' : '#fff' }}>
                    <div className="px-4 py-4 font-semibold text-sm self-center" style={{ color: 'var(--am-navy)' }}>{row.topic}</div>
                    <div className="px-4 py-4 text-sm self-center text-[var(--am-ink-500)]">{row.typical}</div>
                    <div className="px-4 py-4 text-sm font-medium self-center" style={{ color: '#15803d' }}>{row.ours} ✓</div>
                    <div className="px-4 py-4 text-center self-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{ background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }}>
                        {row.advantage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course details */}
        <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="am-heading text-2xl sm:text-3xl mb-10 text-center" style={{ color: 'var(--am-navy)' }}>
              Grade {grade} — {CLASSES_PER_WEEK} live classes a week, plus practice
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div className="am-card p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(118,75,162,0.1)' }}>{course.icon}</span>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--am-navy)' }}>{course.subject}</h3>
                    <p className="text-xs text-[var(--am-ink-400)]">{course.frequency} · live, small group</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[var(--am-ink-700)]">
                  {course.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}>
                        <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="am-card p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: 'rgba(26,26,46,0.07)' }}>📘</span>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--am-navy)' }}>Practice &amp; Assignments</h3>
                    <p className="text-xs text-[var(--am-ink-400)]">Every non-class day</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-[var(--am-ink-700)]">
                  {[
                    'Assignment after every class',
                    'Every submission reviewed and returned',
                    'Prerequisite check before each new chapter',
                    'Progress tracked per student',
                    'Monthly progress report for parents',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-navy)' }}>
                        <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="am-heading text-2xl sm:text-3xl mb-10 text-center" style={{ color: 'var(--am-navy)' }}>
              Grade {grade} Math — common questions
            </h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-bold mb-1.5" style={{ color: 'var(--am-navy)' }}>{f.q}</h3>
                  <p className="text-sm text-[var(--am-ink-600)] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-links + CTA */}
        <section className="py-16 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-[var(--am-ink-500)] mb-4">Looking for a different grade?</p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {OTHER_GRADES[grade].map((g) => (
                <Link key={g} href={`/grade-${g}-math`} className="am-btn px-6 text-sm"
                  style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-ink-700)' }}>
                  Grade {g} Math
                </Link>
              ))}
            </div>
            <Link href="/enquiry" className="am-btn am-btn-primary px-10 text-base">
              Book a free Grade {grade} trial class
            </Link>
          </div>
        </section>
      </article>
      <Footer />
    </main>
  );
}
