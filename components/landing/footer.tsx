// components/landing/footer.tsx
import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Curriculum', href: '/#curriculum' },
      { label: 'Courses', href: '/#courses' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { label: 'Book a free trial', href: '/enquiry' },
      { label: 'Enroll & pay', href: '/payment' },
      { label: 'Sign in', href: '/sign-in' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="py-14 px-6" style={{ background: 'var(--am-navy)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-2">
            <div className="text-white font-bold text-lg mb-3 tracking-tight">
              Academy<span style={{ color: 'var(--am-purple-light)' }}>Minds</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed am-measure">
              Live math and coding classes for Grade 5–7, taught on the Indian curriculum
              — two to three years ahead of grade level.
            </p>
            <a
              href="mailto:hello@academyminds.com"
              className="inline-block mt-4 text-gray-300 hover:text-white text-sm transition-colors"
            >
              hello@academyminds.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="am-eyebrow text-white/80 mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="am-rule mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.12) 80%, transparent)' }} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">© 2026 AcademyMinds. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Grade 5–7 · Math &amp; Coding · Live classes</p>
        </div>
      </div>
    </footer>
  );
}
