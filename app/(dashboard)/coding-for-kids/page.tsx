// app/(dashboard)/coding-for-kids/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { COURSES, GRADES } from '@/lib/content/curriculum';

const TITLE = 'Online Python Coding Classes for Kids (Grade 5–7)';
const FULL_TITLE = 'Online Python Coding Classes for Kids (Grade 5–7) | AcademyMinds';
const DESCRIPTION =
  'Live online Python coding classes for kids in Grade 5–7 — real programming from day one, not visual blocks. Small groups, structured progression from syntax to object-oriented projects, free trial class.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/coding-for-kids' },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, url: '/coding-for-kids' },
};

const FAQS = [
  {
    q: 'Why Python instead of Scratch?',
    a: 'Scratch teaches logic with visual blocks, which is valuable at first — but most Canadian schools stay on Scratch well into middle school. Our students write real Python syntax starting in Grade 5, which is the actual language used in the coding electives and courses they’ll meet in high school and beyond.',
  },
  {
    q: 'Does my child need coding experience already?',
    a: 'No. Grade 5 starts from Python basics and syntax — no prior experience assumed. Students who join at Grade 6 or 7 with no coding background are placed appropriately within the small group.',
  },
  {
    q: 'Is coding taught with math, or can we take it alone?',
    a: 'Coding is its own course (2x/week), separate from math. Most families take both, but either can be taken on its own.',
  },
  {
    q: 'What do students actually build?',
    a: 'It progresses with the grade: Grade 5 builds small mini-projects with fundamentals, Grade 6 builds a calculator app while learning functions and data structures, and Grade 7 finishes with a full game project using object-oriented programming.',
  },
];

export default function CodingForKidsPage() {
  const base = process.env.BASE_URL || 'https://academyminds.com';
  return (
    <main style={{ background: 'var(--am-bg-light)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Python Coding for Kids — AcademyMinds',
            description: DESCRIPTION,
            provider: { '@type': 'EducationalOrganization', name: 'AcademyMinds', sameAs: base },
            educationalLevel: 'Grade 5-7',
            teaches: GRADES.flatMap((g) => COURSES[g].coding.topics),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'AcademyMinds', item: base },
              { '@type': 'ListItem', position: 2, name: 'Coding for Kids', item: `${base}/coding-for-kids` },
            ],
          }),
        }}
      />
      <Navbar />
      <article id="main-content" tabIndex={-1}>
        <section className="am-grain relative py-24 px-4 sm:px-6" style={{ background: 'var(--am-gradient-dark)' }}>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="am-eyebrow mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Coding for Kids · Grade 5–7</p>
            <h1 className="am-display text-3xl sm:text-5xl text-white mb-5">
              Online Python Coding Classes for Kids
            </h1>
            <p className="text-purple-100/85 text-lg leading-relaxed mb-8">
              Real Python from day one — not drag-and-drop blocks. Small live classes that take kids from
              syntax and variables all the way to building their own game.
            </p>
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

        <section className="py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="am-heading text-2xl sm:text-3xl mb-10 text-center" style={{ color: 'var(--am-navy)' }}>
              What your child learns, grade by grade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GRADES.map((g) => {
                const c = COURSES[g].coding;
                return (
                  <div key={g} className="am-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: 'rgba(26,26,46,0.07)' }}>{c.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: 'var(--am-navy)' }}>Grade {g}</h3>
                        <p className="text-xs text-[var(--am-ink-400)]">{c.frequency}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-[var(--am-ink-700)]">
                      {c.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--am-purple)' }}>
                            <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {t}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/grade-${g}-math`} className="block mt-5 text-xs font-semibold underline" style={{ color: 'var(--am-purple)' }}>
                      See Grade {g} math too →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="am-heading text-2xl sm:text-3xl mb-10 text-center" style={{ color: 'var(--am-navy)' }}>
              Coding for kids — common questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="font-bold mb-1.5" style={{ color: 'var(--am-navy)' }}>{f.q}</h3>
                  <p className="text-sm text-[var(--am-ink-600)] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 bg-white text-center">
          <Link href="/enquiry" className="am-btn am-btn-primary px-10 text-base">
            Book a free coding trial class
          </Link>
        </section>
      </article>
      <Footer />
    </main>
  );
}
