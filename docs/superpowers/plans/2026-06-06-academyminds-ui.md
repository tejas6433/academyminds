# AcademyMinds UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete AcademyMinds web UI — landing page, login/signup, student dashboard, parent dashboard, and calendar integration — on top of the existing Next.js 15 SaaS starter.

**Architecture:** Landing page lives at `/` inside `app/(dashboard)/page.tsx` with its own inline navbar (the route group layout becomes a bare wrapper). Dashboard pages under `app/(dashboard)/dashboard/` keep their own layout. All brand tokens are CSS custom properties in `globals.css`. Interactive landing sections are client components; everything else is server components.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 4, Drizzle ORM + Postgres, shadcn/ui (radix-ui), Lucide icons, SWR, no external animation library (CSS keyframes only).

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/globals.css` | Modify | Add brand CSS custom properties |
| `app/(dashboard)/layout.tsx` | Modify | Strip to bare wrapper (no header) |
| `app/(dashboard)/page.tsx` | Rewrite | Full landing page |
| `app/(dashboard)/dashboard/layout.tsx` | Modify | AcademyMinds dashboard header + sidebar |
| `app/(dashboard)/dashboard/page.tsx` | Rewrite | Student dashboard (countdown + schedule) |
| `app/(dashboard)/dashboard/parent/page.tsx` | Create | Parent dashboard |
| `app/(login)/login.tsx` | Rewrite | Split-screen purple/gold auth UI |
| `components/landing/navbar.tsx` | Create | Marketing navbar |
| `components/landing/hero.tsx` | Create | Hero with grade selector |
| `components/landing/curriculum-comparison.tsx` | Create | Interactive grade-aware comparison table |
| `components/landing/courses.tsx` | Create | Course cards per grade |
| `components/landing/teachers.tsx` | Create | Teacher profile cards |
| `components/landing/founding-families.tsx` | Create | Founding families CTA section |
| `components/landing/interactive-demo.tsx` | Create | Math quiz + Python demo tabs |
| `components/landing/pricing.tsx` | Create | 3-tier pricing cards |
| `components/landing/footer.tsx` | Create | Site footer |
| `components/dashboard/countdown-hero.tsx` | Create | Live countdown + JOIN button |
| `components/dashboard/class-schedule.tsx` | Create | Today's schedule list |
| `components/dashboard/weekly-timetable.tsx` | Create | 5-column weekly grid |
| `components/ui/add-to-calendar.tsx` | Create | Google/Apple/Outlook calendar dropdown |
| `lib/calendar.ts` | Create | ICS file generation utility |
| `lib/db/schema.ts` | Modify | Add classes + enrollments tables |

---

## Task 1: Brand Tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add CSS custom properties**

Open `app/globals.css` and add inside `:root`:

```css
:root {
  --am-purple: #764ba2;
  --am-purple-dark: #5a3680;
  --am-purple-light: #9b6bc4;
  --am-gold: #ffd700;
  --am-gold-dark: #e6c200;
  --am-navy: #1a1a2e;
  --am-navy-mid: #16213e;
  --am-navy-light: #0f3460;
  --am-bg-light: #f8f6ff;
  --am-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --am-gradient-dark: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
}
```

Also add these utility classes at the bottom of `globals.css`:

```css
.am-gradient { background: var(--am-gradient); }
.am-gradient-dark { background: var(--am-gradient-dark); }
.am-gold { color: var(--am-gold); }
.am-purple { color: var(--am-purple); }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
}
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 215, 0, 0); }
}
@keyframes count-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-gold { animation: pulse-gold 2s ease-in-out infinite; }
.animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
```

- [ ] **Step 2: Verify dev server runs**

```bash
pnpm dev
```

Expected: No errors, site loads at http://localhost:3000

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add AcademyMinds brand tokens and animation keyframes"
```

---

## Task 2: Strip Dashboard Route Group Layout

**Files:**
- Modify: `app/(dashboard)/layout.tsx`

The existing layout has an ACME header that wraps both the landing page and dashboard. Strip it — the landing page will have its own navbar component, and the dashboard layout will get its own header in Task 8.

- [ ] **Step 1: Replace layout**

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Visit http://localhost:3000 — page should render without the ACME header.

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/layout.tsx
git commit -m "refactor: strip route group layout to bare wrapper"
```

---

## Task 3: Marketing Navbar Component

**Files:**
- Create: `components/landing/navbar.tsx`

- [ ] **Step 1: Create navbar**

```tsx
// components/landing/navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#courses', label: 'Courses' },
  { href: '#teachers', label: 'Teachers' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md"
      style={{ background: 'rgba(26,26,46,0.92)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AcademyMinds" className="h-9 w-auto" />
          <span className="text-white font-bold text-lg hidden sm:block">
            Academy<span style={{ color: 'var(--am-gold)' }}>Minds</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
          >
            Enroll Now
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden px-4 py-6 flex flex-col gap-4 border-t border-white/10"
          style={{ background: 'rgba(26,26,46,0.98)' }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-white text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <Link href="/sign-in" className="text-gray-300 text-base font-medium">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-3 rounded-full text-center font-bold text-sm"
              style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
            >
              Enroll Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Add logo file**

Copy the provided logo PNG to `public/logo.png`. If the logo is only in `design beta/`, run:

```bash
ls "/Users/tejasdutt/academyminds/design beta/"
```

Find the logo file and copy it:

```bash
cp "/Users/tejasdutt/academyminds/design beta/<logo-filename>" "/Users/tejasdutt/academyminds/public/logo.png"
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/navbar.tsx public/logo.png
git commit -m "feat: add AcademyMinds marketing navbar"
```

---

## Task 4: Hero Section

**Files:**
- Create: `components/landing/hero.tsx`

- [ ] **Step 1: Create hero component**

```tsx
// components/landing/hero.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

const GRADES = [5, 6, 7] as const;
type Grade = (typeof GRADES)[number];

const FLOATING_SYMBOLS = ['∑', 'π', '∫', '{}', '=>', '√', 'x²', '</>'];

interface HeroProps {
  onGradeChange: (grade: Grade) => void;
  selectedGrade: Grade;
}

export function Hero({ onGradeChange, selectedGrade }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{ background: 'var(--am-gradient-dark)' }}
    >
      {/* Floating background symbols */}
      {FLOATING_SYMBOLS.map((sym, i) => (
        <span
          key={i}
          className="absolute text-white/10 font-mono font-bold select-none pointer-events-none animate-float"
          style={{
            fontSize: `${1.5 + (i % 3)}rem`,
            left: `${(i * 13) % 90}%`,
            top: `${(i * 17) % 80}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + i}s`,
          }}
        >
          {sym}
        </span>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Founding families badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', color: 'var(--am-gold)' }}
        >
          🌟 First 50 founding families get locked-in pricing forever
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          India's Best Teachers.{' '}
          <span style={{ color: 'var(--am-gold)' }}>
            Your Child's Academic Head Start.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Live math and coding classes for Grade 5–7, taught by Indian
          professionals using a curriculum proven to be{' '}
          <strong className="text-white">2–3 years ahead</strong> of Canadian
          standards.
        </p>

        {/* Grade selector */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="text-gray-400 text-sm mr-2">Your child's grade:</span>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className="px-5 py-2 rounded-full font-bold text-sm transition-all"
              style={
                selectedGrade === g
                  ? { background: 'var(--am-gold)', color: '#1a1a2e', transform: 'scale(1.08)' }
                  : { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }
              }
            >
              Grade {g}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-pulse-gold"
            style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
          >
            Enroll Now — Free Trial
          </Link>
          <a
            href="#curriculum"
            className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10"
            style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}
          >
            See the Curriculum Gap →
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/hero.tsx
git commit -m "feat: add landing page hero section with grade selector"
```

---

## Task 5: Curriculum Comparison Section

**Files:**
- Create: `components/landing/curriculum-comparison.tsx`

- [ ] **Step 1: Create component**

```tsx
// components/landing/curriculum-comparison.tsx
'use client';

import { useState } from 'react';

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
      className="py-24 px-4 sm:px-6"
      style={{ background: 'var(--am-gradient)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Here's Where Your Child Is Today —{' '}
            <span style={{ color: 'var(--am-gold)' }}>
              And Where They'll Be After AcademyMinds
            </span>
          </h2>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            The Indian curriculum covers the same material 2–3 years earlier. That's not an opinion — it's documented in both Ontario and CBSE/ICSE syllabi.
          </p>
        </div>

        {/* Grade tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {([5, 6, 7] as Grade[]).map((g) => (
            <button
              key={g}
              onClick={() => onGradeChange(g)}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all"
              style={
                selectedGrade === g
                  ? { background: 'var(--am-gold)', color: '#1a1a2e' }
                  : { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }
              }
            >
              Grade {g}
            </button>
          ))}
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)' }}>
            <div className="px-4 py-3">Topic</div>
            <div className="px-4 py-3">🍁 Canadian Curriculum</div>
            <div className="px-4 py-3">🇮🇳 AcademyMinds</div>
            <div className="px-4 py-3 text-center">Head Start</div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={row.topic}
              className="grid grid-cols-4 border-t border-white/10 animate-slide-in"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <div className="px-4 py-4 text-white font-semibold text-sm">{row.topic}</div>
              <div className="px-4 py-4 text-red-300 text-sm">{row.canadian}</div>
              <div className="px-4 py-4 text-green-300 text-sm font-medium">{row.indian}</div>
              <div className="px-4 py-4 text-center">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,215,0,0.2)', color: 'var(--am-gold)', border: '1px solid rgba(255,215,0,0.4)' }}
                >
                  {row.advantage}
                </span>
              </div>
            </div>
          ))}
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
            className="inline-block px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
            style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
          >
            See Grade {selectedGrade} Courses →
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/curriculum-comparison.tsx
git commit -m "feat: add interactive curriculum comparison section"
```

---

## Task 6: Courses Section

**Files:**
- Create: `components/landing/courses.tsx`

- [ ] **Step 1: Create component**

```tsx
// components/landing/courses.tsx
type Grade = 5 | 6 | 7;

const COURSES: Record<Grade, { subject: string; icon: string; color: string; topics: string[]; frequency: string; teacher: string }[]> = {
  5: [
    {
      subject: 'Math — Grade 5',
      icon: '🔢',
      color: 'var(--am-purple)',
      topics: ['Advanced Fractions & Decimals', 'Introduction to Algebra', 'Geometry & Measurement', 'Problem Solving Strategies', 'Number Theory Basics'],
      frequency: '3× per week',
      teacher: 'Mr. Rajan Sharma',
    },
    {
      subject: 'Coding — Grade 5',
      icon: '💻',
      color: 'var(--am-gold)',
      topics: ['Python Basics & Syntax', 'Variables & Data Types', 'Conditional Logic (if/else)', 'Loops & Iteration', 'Mini-Projects'],
      frequency: '2× per week',
      teacher: 'Ms. Priya Nair',
    },
  ],
  6: [
    {
      subject: 'Math — Grade 6',
      icon: '🔢',
      color: 'var(--am-purple)',
      topics: ['Full Algebra Chapter', 'Ratios & Proportions', 'Data & Statistics', 'Integers & Number Theory', 'Geometric Constructions'],
      frequency: '3× per week',
      teacher: 'Mr. Rajan Sharma',
    },
    {
      subject: 'Coding — Grade 6',
      icon: '💻',
      color: 'var(--am-gold)',
      topics: ['Python Functions', 'Lists & Dictionaries', 'File I/O Basics', 'Debugging Techniques', 'Build a Calculator App'],
      frequency: '2× per week',
      teacher: 'Ms. Priya Nair',
    },
  ],
  7: [
    {
      subject: 'Math — Grade 7',
      icon: '🔢',
      color: 'var(--am-purple)',
      topics: ['Linear Equations & Inequalities', 'Geometry Proofs', 'Exponents & Powers', 'Financial Math & Percentages', 'Intro to Probability'],
      frequency: '3× per week',
      teacher: 'Mr. Rajan Sharma',
    },
    {
      subject: 'Coding — Grade 7',
      icon: '💻',
      color: 'var(--am-gold)',
      topics: ['OOP Concepts in Python', 'Classes & Objects', 'APIs & JSON', 'Mini Web Projects', 'Final Project: Build a Game'],
      frequency: '2× per week',
      teacher: 'Ms. Priya Nair',
    },
  ],
};

interface CoursesProps {
  selectedGrade: Grade;
}

export function Courses({ selectedGrade }: CoursesProps) {
  const courses = COURSES[selectedGrade];

  return (
    <section id="courses" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--am-navy)' }}>
            Grade {selectedGrade} Curriculum
          </h2>
          <p className="text-gray-500 text-lg">Live classes, real teachers, real results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((c) => (
            <div
              key={c.subject}
              className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group"
            >
              {/* Card header */}
              <div className="p-6" style={{ background: c.color }}>
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="text-xl font-bold text-white">{c.subject}</h3>
                <div className="text-white/80 text-sm mt-1">{c.frequency} • {c.teacher}</div>
              </div>

              {/* Card body */}
              <div className="p-6 bg-white">
                <ul className="space-y-2 mb-6">
                  {c.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-gray-700 text-sm">
                      <span style={{ color: c.color }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <a
                    href="/sign-up"
                    className="flex-1 py-3 rounded-full text-center font-bold text-sm text-white transition-all hover:opacity-90"
                    style={{ background: c.color }}
                  >
                    Enroll in this course
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/courses.tsx
git commit -m "feat: add courses section with grade-aware cards"
```

---

## Task 7: Teachers Section

**Files:**
- Create: `components/landing/teachers.tsx`

- [ ] **Step 1: Create component**

```tsx
// components/landing/teachers.tsx
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
    <section id="teachers" className="py-24 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--am-navy)' }}>
            Meet Your Teachers
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Verified Indian educators with deep subject mastery and a passion for teaching young minds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEACHERS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-5 mb-6">
                {/* Avatar placeholder */}
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: 'var(--am-gradient)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--am-navy)' }}>{t.name}</h3>
                  <div className="text-sm font-medium" style={{ color: 'var(--am-purple)' }}>{t.subject}</div>
                  <div
                    className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }}
                  >
                    ✓ Verified Indian Educator
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🎓</span> {t.qual}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📅</span> {t.exp} teaching experience
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/teachers.tsx
git commit -m "feat: add teachers section"
```

---

## Task 8: Founding Families, Interactive Demo, Pricing, Footer

**Files:**
- Create: `components/landing/founding-families.tsx`
- Create: `components/landing/interactive-demo.tsx`
- Create: `components/landing/pricing.tsx`
- Create: `components/landing/footer.tsx`

- [ ] **Step 1: Founding Families**

```tsx
// components/landing/founding-families.tsx
export function FoundingFamilies() {
  const claimed = 23; // static for now
  const total = 50;
  const pct = Math.round((claimed / total) * 100);

  return (
    <section className="py-24 px-4 sm:px-6" style={{ background: 'var(--am-navy)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-4xl mb-6">🌟</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Join Our Founding Families
        </h2>
        <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          We're launching with a small first cohort. The first 50 families get founding member pricing — locked in forever, even as prices increase.
        </p>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{claimed} founding spots claimed</span>
            <span>{total - claimed} remaining</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'var(--am-gold)' }}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🔒', title: 'Founding Price Locked', desc: 'Your rate never increases' },
            { icon: '👩‍🏫', title: 'Direct Teacher Access', desc: 'Priority booking & feedback' },
            { icon: '🗺️', title: 'Shape the Curriculum', desc: 'Input on what gets taught' },
          ].map((b) => (
            <div key={b.title} className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl mb-2">{b.icon}</div>
              <div className="text-white font-bold text-sm">{b.title}</div>
              <div className="text-gray-400 text-xs mt-1">{b.desc}</div>
            </div>
          ))}
        </div>

        <a
          href="/sign-up"
          className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
        >
          Claim Your Founding Spot
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Interactive Demo**

```tsx
// components/landing/interactive-demo.tsx
'use client';

import { useState } from 'react';

const MATH_QUIZ = {
  question: 'A train travels 240 km in 3 hours. What is its speed in km/h?',
  options: ['60 km/h', '80 km/h', '72 km/h', '90 km/h'],
  correct: 1,
  explanation: 'Speed = Distance ÷ Time = 240 ÷ 3 = 80 km/h',
};

const PYTHON_CODE = `# Print the 5-times table
for i in range(1, 11):
    print(f"5 × {i} = {5 * i}")`;

const PYTHON_OUTPUT = Array.from({ length: 10 }, (_, i) => `5 × ${i + 1} = ${5 * (i + 1)}`).join('\n');

export function InteractiveDemo() {
  const [tab, setTab] = useState<'math' | 'code'>('math');
  const [selected, setSelected] = useState<number | null>(null);
  const [ran, setRan] = useState(false);

  const handleAnswer = (i: number) => setSelected(i);
  const isCorrect = selected === MATH_QUIZ.correct;
  const isWrong = selected !== null && selected !== MATH_QUIZ.correct;

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--am-navy)' }}>
            Try a Lesson — Right Now
          </h2>
          <p className="text-gray-500 text-lg">No signup needed. See how our classes actually feel.</p>
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-full p-1 mb-10 mx-auto w-fit"
          style={{ background: 'var(--am-bg-light)' }}
        >
          {(['math', 'code'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); setRan(false); }}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all"
              style={
                tab === t
                  ? { background: 'var(--am-purple)', color: 'white' }
                  : { color: 'var(--am-purple)' }
              }
            >
              {t === 'math' ? '🔢 Math Challenge' : '💻 Code It'}
            </button>
          ))}
        </div>

        {tab === 'math' && (
          <div className="rounded-2xl p-8 shadow-lg" style={{ background: 'var(--am-bg-light)', border: '2px solid rgba(118,75,162,0.15)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--am-purple)' }}>
              Grade 6 Math • Word Problems
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-8">{MATH_QUIZ.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATH_QUIZ.options.map((opt, i) => {
                const isSelected = selected === i;
                const correct = i === MATH_QUIZ.correct;
                let style = { border: '2px solid #e5e7eb', background: 'white', color: '#374151' };
                if (selected !== null) {
                  if (correct) style = { border: '2px solid #22c55e', background: '#f0fdf4', color: '#15803d' };
                  else if (isSelected) style = { border: '2px solid #ef4444', background: '#fef2f2', color: '#b91c1c' };
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className="p-4 rounded-xl text-left font-medium transition-all hover:scale-[1.02] disabled:hover:scale-100"
                    style={style}
                  >
                    <span className="text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div
                className="mt-6 p-4 rounded-xl text-sm font-medium"
                style={isCorrect
                  ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                  : { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}
              >
                {isCorrect ? '🎉 Correct! ' : '❌ Not quite. '}
                {MATH_QUIZ.explanation}
              </div>
            )}
            {selected !== null && (
              <div className="mt-6 text-center">
                <a href="/sign-up" className="inline-block px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--am-purple)' }}>
                  Get more like this — Enroll Free →
                </a>
              </div>
            )}
          </div>
        )}

        {tab === 'code' && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 flex items-center justify-between" style={{ background: '#1e1e2e' }}>
              <span className="text-xs font-mono" style={{ color: 'var(--am-gold)' }}>times_table.py</span>
              <button
                onClick={() => setRan(true)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
              >
                ▶ Run
              </button>
            </div>
            <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto" style={{ background: '#12121f', color: '#c9d1d9' }}>
              <code>
                {PYTHON_CODE.split('\n').map((line, i) => (
                  <div key={i}>
                    <span style={{ color: '#6b7280', userSelect: 'none', marginRight: '1rem' }}>{i + 1}</span>
                    {line
                      .replace(/(#.*)/, '<comment>$1</comment>')
                      .split(/<comment>|<\/comment>/)
                      .map((part, j) =>
                        part.startsWith('#')
                          ? <span key={j} style={{ color: '#6b7280' }}>{part}</span>
                          : <span key={j}>{part}</span>
                      )}
                  </div>
                ))}
              </code>
            </pre>
            {ran && (
              <div className="p-4 border-t" style={{ background: '#0d0d1a', borderColor: '#333' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'var(--am-gold)' }}>Output:</div>
                <pre className="text-xs font-mono leading-relaxed" style={{ color: '#4ade80' }}>{PYTHON_OUTPUT}</pre>
              </div>
            )}
            {ran && (
              <div className="p-4 text-center" style={{ background: '#12121f' }}>
                <a href="/sign-up" className="inline-block px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}>
                  Loved it? Enroll free →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Pricing**

```tsx
// components/landing/pricing.tsx
const PLANS = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '2 free classes',
    description: 'No credit card required. Try before you commit.',
    features: ['2 live classes (any subject)', 'Full access to class materials', 'Join on any device', 'Cancel anytime'],
    cta: 'Start Free Trial',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Monthly',
    price: '$79',
    period: '/month',
    description: 'Flexible month-to-month. Cancel anytime.',
    features: ['Unlimited live classes', 'Math + Coding access', 'Class recordings', 'Progress reports', 'Add to calendar integration', 'Email support'],
    cta: 'Enroll Monthly',
    href: '/sign-up?plan=monthly',
    highlight: true,
  },
  {
    name: 'Annual',
    price: '$699',
    period: '/year',
    badge: 'Save 26%',
    description: 'Best value. Locked-in rate forever for founding members.',
    features: ['Everything in Monthly', 'Priority class slots', 'Founding member rate locked', 'Direct teacher Q&A sessions', 'Monthly progress call with teacher'],
    cta: 'Enroll Annually',
    href: '/sign-up?plan=annual',
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6" style={{ background: 'var(--am-bg-light)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--am-navy)' }}>
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 text-lg">
            Start free. All class schedules sync to your phone calendar automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl overflow-hidden shadow-lg flex flex-col"
              style={
                plan.highlight
                  ? { border: '2px solid var(--am-purple)', background: 'white' }
                  : { border: '1px solid #e5e7eb', background: 'white' }
              }
            >
              {plan.highlight && (
                <div className="py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                  style={{ background: 'var(--am-purple)' }}>
                  Most Popular
                </div>
              )}
              {(plan as any).badge && (
                <div className="py-2 text-center text-xs font-bold uppercase tracking-widest"
                  style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--am-gold)', borderBottom: '1px solid rgba(255,215,0,0.3)' }}>
                  {(plan as any).badge}
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--am-navy)' }}>{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-extrabold" style={{ color: 'var(--am-purple)' }}>{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span style={{ color: 'var(--am-purple)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.href}
                  className="w-full py-3 rounded-full text-center font-bold text-sm transition-all hover:opacity-90 block"
                  style={
                    plan.highlight
                      ? { background: 'var(--am-purple)', color: 'white' }
                      : { border: '2px solid var(--am-purple)', color: 'var(--am-purple)' }
                  }
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Footer**

```tsx
// components/landing/footer.tsx
export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6" style={{ background: 'var(--am-navy)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-white font-bold text-lg mb-2">
              Academy<span style={{ color: 'var(--am-gold)' }}>Minds</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              India's best teachers, helping Canadian students get a 2–3 year academic head start.
            </p>
          </div>
          {[
            { heading: 'Learn', links: ['Courses', 'Teachers', 'How It Works', 'Pricing'] },
            { heading: 'Company', links: ['About', 'Blog', 'Contact'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 AcademyMinds. All rights reserved.</p>
          <p className="text-gray-500 text-sm">🇮🇳 Teaching Excellence • 🍁 Canadian Students</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/founding-families.tsx components/landing/interactive-demo.tsx components/landing/pricing.tsx components/landing/footer.tsx
git commit -m "feat: add founding families, interactive demo, pricing, and footer sections"
```

---

## Task 9: Assemble Landing Page

**Files:**
- Rewrite: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Rewrite landing page**

```tsx
// app/(dashboard)/page.tsx
'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { CurriculumComparison } from '@/components/landing/curriculum-comparison';
import { Courses } from '@/components/landing/courses';
import { Teachers } from '@/components/landing/teachers';
import { FoundingFamilies } from '@/components/landing/founding-families';
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

type Grade = 5 | 6 | 7;

export default function LandingPage() {
  const [grade, setGrade] = useState<Grade>(6);

  return (
    <main>
      <Navbar />
      <Hero selectedGrade={grade} onGradeChange={setGrade} />
      <CurriculumComparison selectedGrade={grade} onGradeChange={setGrade} />
      <Courses selectedGrade={grade} />
      <Teachers />
      <InteractiveDemo />
      <FoundingFamilies />
      <Pricing />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Run and visually verify**

```bash
pnpm dev
```

Open http://localhost:3000. Check:
- Navbar fixed, shows logo + links + Enroll button
- Hero loads with floating symbols, grade selector works
- Clicking grade updates hero pills AND scrolling to curriculum shows correct grade data
- All sections render without errors

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/page.tsx
git commit -m "feat: assemble full AcademyMinds landing page"
```

---

## Task 10: Login / Sign-Up Redesign

**Files:**
- Rewrite: `app/(login)/login.tsx`

- [ ] **Step 1: Rewrite login component**

```tsx
// app/(login)/login.tsx
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--am-gradient)' }}
      >
        {/* Floating symbols */}
        {['∑', 'π', '{}', '=>', '√', 'x²'].map((sym, i) => (
          <span
            key={i}
            className="absolute text-white/10 font-mono font-bold select-none animate-float"
            style={{
              fontSize: `${2 + (i % 2)}rem`,
              left: `${(i * 17) % 80}%`,
              top: `${(i * 23) % 75}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            {sym}
          </span>
        ))}

        <div className="relative z-10">
          <Link href="/" className="text-white font-bold text-2xl">
            Academy<span style={{ color: 'var(--am-gold)' }}>Minds</span>
          </Link>
        </div>

        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-4 uppercase tracking-widest font-semibold">
            What parents say
          </p>
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-4">
            "My daughter went from average grades to top of her class in 4 months. The Indian curriculum advantage is real."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              SA
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Sunita A.</div>
              <div className="text-white/60 text-xs">Parent of Grade 6 student</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-xs">
          © 2026 AcademyMinds
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--am-navy)' }}>
              Academy<span style={{ color: 'var(--am-purple)' }}>Minds</span>
            </Link>
          </div>

          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--am-navy)' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {isSignUp
              ? 'Start your free trial — no credit card required.'
              : 'Sign in to access your dashboard.'}
          </p>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />

            {isSignUp && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Parent name</Label>
                <Input id="name" name="name" type="text" placeholder="Your full name" required className="mt-1" />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                {!isSignUp && (
                  <a href="#" className="text-xs" style={{ color: 'var(--am-purple)' }}>Forgot password?</a>
                )}
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" required className="mt-1" />
            </div>

            {state?.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-full font-bold text-base"
              style={{ background: 'var(--am-purple)', color: 'white' }}
            >
              {pending ? 'Please wait...' : isSignUp ? 'Create Account & Start Free Trial' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            {isSignUp ? (
              <>Already have an account?{' '}
                <Link href="/sign-in" style={{ color: 'var(--am-purple)' }} className="font-semibold">Sign in</Link>
              </>
            ) : (
              <>New to AcademyMinds?{' '}
                <Link href="/sign-up" style={{ color: 'var(--am-purple)' }} className="font-semibold">Enroll your child →</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify sign-in and sign-up pages**

```bash
pnpm dev
```

Visit http://localhost:3000/sign-in and http://localhost:3000/sign-up. Check:
- Split layout shows on desktop (lg+)
- Single column on mobile
- Form submits without JS errors
- Links between sign-in/sign-up work

- [ ] **Step 3: Commit**

```bash
git add app/(login)/login.tsx
git commit -m "feat: redesign login/signup with purple/gold split-screen layout"
```

---

## Task 11: DB Schema — Classes + Enrollments

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add classes and enrollments tables**

Open `lib/db/schema.ts` and append after the existing `invitations` table:

```ts
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  subject: varchar('subject', { length: 20 }).notNull(), // 'math' | 'coding'
  gradeLevel: integer('grade_level').notNull(), // 5, 6, or 7
  teacherName: varchar('teacher_name', { length: 100 }).notNull(),
  teacherTitle: varchar('teacher_title', { length: 200 }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun, 1=Mon...6=Sat
  startTimeUtc: varchar('start_time_utc', { length: 8 }).notNull(), // 'HH:MM:SS'
  durationMinutes: integer('duration_minutes').notNull().default(60),
  joinUrl: text('join_url'),
  rrule: varchar('rrule', { length: 100 }).default('FREQ=WEEKLY'), // iCal RRULE
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const classEnrollments = pgTable('class_enrollments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  classId: integer('class_id').notNull().references(() => classes.id),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
});

export const classesRelations = relations(classes, ({ many }) => ({
  enrollments: many(classEnrollments),
}));

export const classEnrollmentsRelations = relations(classEnrollments, ({ one }) => ({
  user: one(users, { fields: [classEnrollments.userId], references: [users.id] }),
  class: one(classes, { fields: [classEnrollments.classId], references: [classes.id] }),
}));
```

Also update `usersRelations` to include enrollments:

```ts
export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  classEnrollments: many(classEnrollments), // add this line
}));
```

- [ ] **Step 2: Generate and run migration**

```bash
pnpm db:generate
pnpm db:migrate
```

Expected: Migration files created and applied without errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db/schema.ts
git commit -m "feat: add classes and class_enrollments tables to schema"
```

---

## Task 12: Calendar Utility + AddToCalendar Component

**Files:**
- Create: `lib/calendar.ts`
- Create: `components/ui/add-to-calendar.tsx`

- [ ] **Step 1: Create ICS generation utility**

```ts
// lib/calendar.ts

export interface CalendarClass {
  id: number | string;
  name: string;
  teacherName: string;
  subject: 'math' | 'coding';
  gradeLevel: number;
  /** ISO 8601 datetime string for first occurrence, e.g. "2026-06-09T16:00:00Z" */
  startTimeIso: string;
  durationMinutes: number;
  joinUrl?: string;
  /** iCal RRULE value, e.g. "FREQ=WEEKLY" */
  rrule?: string;
}

function formatIcsDate(iso: string): string {
  // Convert ISO to iCal YYYYMMDDTHHMMSSZ format
  return iso.replace(/[-:]/g, '').replace('.000', '');
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(new Date(iso).getTime() + minutes * 60000);
  return d.toISOString();
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateIcs(classes: CalendarClass[]): string {
  const events = classes.map((c) => {
    const dtstart = formatIcsDate(c.startTimeIso);
    const dtend = formatIcsDate(addMinutes(c.startTimeIso, c.durationMinutes));
    const summary = escapeIcsText(`AcademyMinds — ${c.subject === 'math' ? 'Math' : 'Coding'}: ${c.name} (Grade ${c.gradeLevel})`);
    const description = escapeIcsText(`Teacher: ${c.teacherName}${c.joinUrl ? `\nJoin link: ${c.joinUrl}` : ''}`);
    const location = c.joinUrl ? escapeIcsText(c.joinUrl) : '';
    const rrule = c.rrule ? `RRULE:${c.rrule}\n` : '';

    return [
      'BEGIN:VEVENT',
      `UID:am-class-${c.id}@academyminds.com`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `${rrule}SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${location}` : '',
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AcademyMinds//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildGoogleCalendarUrl(c: CalendarClass): string {
  const start = c.startTimeIso.replace(/[-:]/g, '').replace('.000Z', 'Z');
  const end = addMinutes(c.startTimeIso, c.durationMinutes).replace(/[-:]/g, '').replace('.000Z', 'Z');
  const title = encodeURIComponent(`AcademyMinds — ${c.subject === 'math' ? 'Math' : 'Coding'}: ${c.name}`);
  const details = encodeURIComponent(`Teacher: ${c.teacherName}${c.joinUrl ? `\nJoin: ${c.joinUrl}` : ''}`);
  const location = c.joinUrl ? encodeURIComponent(c.joinUrl) : '';
  const recur = c.rrule ? `&recur=RRULE:${encodeURIComponent(c.rrule)}` : '';
  return `https://calendar.google.com/calendar/r?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}${recur}`;
}
```

- [ ] **Step 2: Create AddToCalendar dropdown component**

```tsx
// components/ui/add-to-calendar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarClass, generateIcs, buildGoogleCalendarUrl } from '@/lib/calendar';
import { CalendarPlus } from 'lucide-react';

interface AddToCalendarProps {
  classes: CalendarClass[];
  label?: string;
  variant?: 'icon' | 'button';
}

export function AddToCalendar({ classes, label = 'Add to Calendar', variant = 'button' }: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function downloadIcs() {
    const content = generateIcs(classes);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academyminds-classes.ics';
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  function openGoogle() {
    // For multiple classes, open tabs for each (or just first if many)
    const url = buildGoogleCalendarUrl(classes[0]);
    window.open(url, '_blank');
    setOpen(false);
  }

  const OPTIONS = [
    { icon: '📅', label: 'Google Calendar', action: openGoogle },
    { icon: '🍎', label: 'Apple Calendar (.ics)', action: downloadIcs },
    { icon: '📆', label: 'Outlook (.ics)', action: downloadIcs },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={
          variant === 'button'
            ? { padding: '8px 16px', borderRadius: '999px', border: '1px solid var(--am-purple)', color: 'var(--am-purple)' }
            : { color: 'var(--am-purple)' }
        }
        title={label}
      >
        <CalendarPlus className="h-4 w-4" />
        {variant === 'button' && <span>{label}</span>}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 right-0 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'white', border: '1px solid #e5e7eb', minWidth: '200px' }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 flex items-center gap-3 transition-colors"
              style={{ color: '#374151' }}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/calendar.ts components/ui/add-to-calendar.tsx
git commit -m "feat: add ICS calendar generation and AddToCalendar component"
```

---

## Task 13: Student Dashboard

**Files:**
- Create: `components/dashboard/countdown-hero.tsx`
- Create: `components/dashboard/class-schedule.tsx`
- Rewrite: `app/(dashboard)/dashboard/page.tsx`
- Modify: `app/(dashboard)/dashboard/layout.tsx`

- [ ] **Step 1: Create CountdownHero**

```tsx
// components/dashboard/countdown-hero.tsx
'use client';

import { useEffect, useState } from 'react';
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

interface CountdownHeroProps {
  nextClass: {
    name: string;
    subject: string;
    teacherName: string;
    gradeLevel: number;
    startsAt: Date; // UTC
    joinUrl: string;
  } | null;
  calendarClass?: CalendarClass;
}

function useCountdown(target: Date | null) {
  const [diff, setDiff] = useState<number>(0);

  useEffect(() => {
    if (!target) return;
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, totalSec };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function CountdownHero({ nextClass, calendarClass }: CountdownHeroProps) {
  const { h, m, s, totalSec } = useCountdown(nextClass?.startsAt ?? null);
  const canJoin = totalSec <= 600 && totalSec > 0; // joinable 10 min before

  if (!nextClass) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--am-gradient)' }}>
        <p className="text-white/70 text-lg">No upcoming classes scheduled.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden" style={{ background: 'var(--am-gradient)' }}>
      {/* Calendar button */}
      {calendarClass && (
        <div className="absolute top-4 right-4">
          <AddToCalendar classes={[calendarClass]} variant="icon" />
        </div>
      )}

      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,215,0,0.8)' }}>
        ⏰ Next Class
      </div>

      <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-1">{nextClass.name}</h2>
      <p className="text-white/70 text-sm mb-6">
        {nextClass.subject === 'math' ? '🔢' : '💻'} {nextClass.teacherName} · Grade {nextClass.gradeLevel}
      </p>

      {/* Countdown */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { val: pad(h), label: 'hrs' },
          { val: pad(m), label: 'min' },
          { val: pad(s), label: 'sec' },
        ].map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            {i > 0 && <span className="text-white/40 text-3xl font-bold">:</span>}
            <div className="text-center">
              <div
                className="text-4xl sm:text-5xl font-extrabold tabular-nums"
                style={{ color: 'var(--am-gold)' }}
              >
                {unit.val}
              </div>
              <div className="text-white/50 text-xs uppercase tracking-wide mt-1">{unit.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* JOIN button */}
      {canJoin ? (
        <a
          href={nextClass.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all hover:scale-105 animate-pulse-gold"
          style={{ background: 'var(--am-gold)', color: '#1a1a2e' }}
        >
          🚀 Join Class Now
        </a>
      ) : (
        <div
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base cursor-not-allowed opacity-60"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          🔒 Join opens 10 min before class
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ClassSchedule**

```tsx
// components/dashboard/class-schedule.tsx
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

interface ScheduledClass {
  id: number;
  name: string;
  subject: 'math' | 'coding';
  teacherName: string;
  startsAt: Date;
  durationMinutes: number;
  joinUrl?: string;
  status: 'upcoming' | 'live' | 'completed' | 'missed';
}

interface ClassScheduleProps {
  classes: ScheduledClass[];
}

const STATUS_STYLES: Record<ScheduledClass['status'], { bg: string; color: string; label: string }> = {
  live: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '🔴 Live Now' },
  upcoming: { bg: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)', label: 'Upcoming' },
  completed: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: '✓ Completed' },
  missed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Missed' },
};

function toCalendarClass(c: ScheduledClass): CalendarClass {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    gradeLevel: 6,
    teacherName: c.teacherName,
    startTimeIso: c.startsAt.toISOString(),
    durationMinutes: c.durationMinutes,
    joinUrl: c.joinUrl,
    rrule: 'FREQ=WEEKLY',
  };
}

export function ClassSchedule({ classes }: ClassScheduleProps) {
  if (classes.length === 0) {
    return <p className="text-gray-400 text-sm py-4">No classes scheduled for today.</p>;
  }

  return (
    <div className="space-y-3">
      {classes.map((c) => {
        const s = STATUS_STYLES[c.status];
        const timeStr = c.startsAt.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: true });

        return (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl px-4 py-4"
            style={{ background: 'white', border: '1px solid #f0ebff' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{c.subject === 'math' ? '🔢' : '💻'}</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--am-navy)' }}>{c.name}</div>
                <div className="text-gray-400 text-xs">{timeStr} · {c.teacherName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: s.bg, color: s.color }}
              >
                {s.label}
              </span>
              {(c.status === 'upcoming' || c.status === 'live') && (
                <AddToCalendar classes={[toCalendarClass(c)]} variant="icon" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite dashboard page with mock data**

```tsx
// app/(dashboard)/dashboard/page.tsx
import { CountdownHero } from '@/components/dashboard/countdown-hero';
import { ClassSchedule } from '@/components/dashboard/class-schedule';
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

// Mock data — replace with DB queries once classes table is seeded
const MOCK_NEXT_CLASS = {
  name: 'Algebra — Chapter 3',
  subject: 'math' as const,
  teacherName: 'Mr. Rajan Sharma',
  gradeLevel: 6,
  startsAt: new Date(Date.now() + 25 * 60 * 1000), // 25 min from now
  joinUrl: 'https://meet.google.com/placeholder',
};

const MOCK_TODAY: Parameters<typeof ClassSchedule>[0]['classes'] = [
  {
    id: 1,
    name: 'Algebra — Chapter 3',
    subject: 'math',
    teacherName: 'Mr. Rajan Sharma',
    startsAt: new Date(Date.now() + 25 * 60 * 1000),
    durationMinutes: 60,
    joinUrl: 'https://meet.google.com/placeholder',
    status: 'upcoming',
  },
  {
    id: 2,
    name: 'Python — Functions',
    subject: 'coding',
    teacherName: 'Ms. Priya Nair',
    startsAt: new Date(Date.now() + 115 * 60 * 1000),
    durationMinutes: 60,
    joinUrl: 'https://meet.google.com/placeholder',
    status: 'upcoming',
  },
];

const MOCK_CALENDAR_CLASS: CalendarClass = {
  id: 1,
  name: 'Algebra — Chapter 3',
  subject: 'math',
  gradeLevel: 6,
  teacherName: 'Mr. Rajan Sharma',
  startTimeIso: MOCK_NEXT_CLASS.startsAt.toISOString(),
  durationMinutes: 60,
  joinUrl: MOCK_NEXT_CLASS.joinUrl,
  rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
};

const ALL_CALENDAR_CLASSES: CalendarClass[] = MOCK_TODAY.map((c) => ({
  id: c.id,
  name: c.name,
  subject: c.subject,
  gradeLevel: 6,
  teacherName: c.teacherName,
  startTimeIso: c.startsAt.toISOString(),
  durationMinutes: c.durationMinutes,
  joinUrl: c.joinUrl,
  rrule: 'FREQ=WEEKLY',
}));

export default function StudentDashboard() {
  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--am-navy)' }}>
          👋 Good afternoon!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your class schedule for today.</p>
      </div>

      {/* Countdown hero */}
      <div className="mb-8">
        <CountdownHero nextClass={MOCK_NEXT_CLASS} calendarClass={MOCK_CALENDAR_CLASS} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Classes attended', value: '12' },
          { label: 'Attendance', value: '100%' },
          { label: 'Current streak', value: '5 🔥' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--am-bg-light)', border: '1px solid rgba(118,75,162,0.15)' }}
          >
            <div className="text-2xl font-extrabold" style={{ color: 'var(--am-purple)' }}>{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--am-navy)' }}>Today's Classes</h2>
        <AddToCalendar classes={ALL_CALENDAR_CLASSES} label="Sync all to calendar" />
      </div>
      <ClassSchedule classes={MOCK_TODAY} />
    </section>
  );
}
```

- [ ] **Step 4: Update dashboard layout header**

Open `app/(dashboard)/dashboard/layout.tsx` and replace it:

```tsx
// app/(dashboard)/dashboard/layout.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--am-bg-light)' }}>
      {/* Dashboard header */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ background: 'rgba(26,26,46,0.95)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">
            Academy<span style={{ color: 'var(--am-gold)' }}>Minds</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">Schedule</Link>
            <Link href="/dashboard/general" className="text-gray-300 hover:text-white text-sm transition-colors">Settings</Link>
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--am-purple)' }}
            >
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Verify dashboard**

```bash
pnpm dev
```

Sign in at http://localhost:3000/sign-in, then visit http://localhost:3000/dashboard. Check:
- Navy header with AcademyMinds logo
- Countdown ticking live
- JOIN button grey (unless within 10 min)
- Today's schedule shows 2 classes
- "Add to Calendar" dropdown opens with 3 options
- "Sync all to calendar" button visible

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/countdown-hero.tsx components/dashboard/class-schedule.tsx app/(dashboard)/dashboard/page.tsx app/(dashboard)/dashboard/layout.tsx
git commit -m "feat: build student dashboard with live countdown and calendar integration"
```

---

## Task 14: Parent Dashboard

**Files:**
- Create: `app/(dashboard)/dashboard/parent/page.tsx`

- [ ] **Step 1: Create parent dashboard**

```tsx
// app/(dashboard)/dashboard/parent/page.tsx
import { AddToCalendar } from '@/components/ui/add-to-calendar';
import { CalendarClass } from '@/lib/calendar';

// Mock — replace with real DB data
const CHILD_NAME = 'Arjun';
const ATTENDANCE_STATS = { attended: 12, total: 13, streak: 5 };

const ALL_CLASSES: CalendarClass[] = [
  {
    id: 1,
    name: 'Math — Grade 6',
    subject: 'math',
    gradeLevel: 6,
    teacherName: 'Mr. Rajan Sharma',
    startTimeIso: '2026-06-09T20:00:00Z',
    durationMinutes: 60,
    rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
  },
  {
    id: 2,
    name: 'Coding — Grade 6',
    subject: 'coding',
    gradeLevel: 6,
    teacherName: 'Ms. Priya Nair',
    startTimeIso: '2026-06-10T21:30:00Z',
    durationMinutes: 60,
    rrule: 'FREQ=WEEKLY;BYDAY=TU,TH',
  },
];

export default function ParentDashboard() {
  const attendancePct = Math.round((ATTENDANCE_STATS.attended / ATTENDANCE_STATS.total) * 100);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--am-navy)' }}>
            {CHILD_NAME}'s Progress
          </h1>
          <p className="text-gray-500 text-sm mt-1">Grade 6 · Math + Coding</p>
        </div>
        <AddToCalendar classes={ALL_CLASSES} label={`Sync ${CHILD_NAME}'s classes`} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Classes attended', value: `${ATTENDANCE_STATS.attended}/${ATTENDANCE_STATS.total}` },
          { label: 'Attendance rate', value: `${attendancePct}%` },
          { label: 'Day streak', value: `${ATTENDANCE_STATS.streak} 🔥` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5 text-center bg-white shadow-sm" style={{ border: '1px solid #f0ebff' }}>
            <div className="text-2xl font-extrabold" style={{ color: 'var(--am-purple)' }}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming classes */}
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--am-navy)' }}>Upcoming Classes</h2>
      </div>
      <div className="space-y-3 mb-8">
        {ALL_CLASSES.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl px-5 py-4 bg-white shadow-sm"
            style={{ border: '1px solid #f0ebff' }}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{c.subject === 'math' ? '🔢' : '💻'}</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--am-navy)' }}>{c.name}</div>
                <div className="text-gray-400 text-xs">{c.teacherName} · {c.rrule?.includes('MO') ? 'Mon, Wed, Fri' : 'Tue, Thu'}</div>
              </div>
            </div>
            <AddToCalendar classes={[c]} variant="icon" />
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="rounded-2xl p-6 bg-white shadow-sm" style={{ border: '1px solid #f0ebff' }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--am-navy)' }}>Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Monthly Plan</p>
            <p className="text-gray-400 text-sm">Next billing: July 6, 2026</p>
          </div>
          <a
            href="/dashboard/general"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors hover:opacity-90"
            style={{ border: '1px solid var(--am-purple)', color: 'var(--am-purple)' }}
          >
            Manage
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Visit http://localhost:3000/dashboard/parent. Check:
- Child's name, stats, class list render
- "Sync classes" button opens AddToCalendar dropdown
- Per-class calendar icons work

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/parent/page.tsx
git commit -m "feat: add parent dashboard with attendance stats and calendar sync"
```

---

## Task 15: Final Build Check

- [ ] **Step 1: Production build**

```bash
pnpm build
```

Expected: Compiled successfully. Fix any TypeScript or import errors before proceeding.

- [ ] **Step 2: Verify logo file exists**

```bash
ls public/logo.png
```

If missing, place the provided logo at `public/logo.png`.

- [ ] **Step 3: Add .superpowers to .gitignore**

```bash
echo '.superpowers/' >> .gitignore
git add .gitignore
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete AcademyMinds UI — landing, login, dashboard, calendar integration"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Navbar (Task 3)
- ✅ Hero with grade selector (Task 4)
- ✅ Curriculum comparison interactive table (Task 5)
- ✅ Courses per grade (Task 6)
- ✅ Teachers section (Task 7)
- ✅ Founding families CTA (Task 8)
- ✅ Interactive demo — math quiz + Python (Task 8)
- ✅ Pricing — 3 plans (Task 8)
- ✅ Footer (Task 8)
- ✅ Login/signup redesign split-screen (Task 10)
- ✅ DB schema classes + enrollments (Task 11)
- ✅ Calendar ICS generation (Task 12)
- ✅ AddToCalendar component — Google/Apple/Outlook (Task 12)
- ✅ Student dashboard countdown hero (Task 13)
- ✅ Today's schedule (Task 13)
- ✅ Dashboard header AcademyMinds branded (Task 13)
- ✅ Parent dashboard with child stats + calendar sync (Task 14)

**Known gaps (acceptable for v1):**
- Weekly timetable grid view — not included. Student can see today only. Add in v2.
- Real DB queries for classes — using mock data. Seed DB after schema migration (Task 11).
- Google OAuth — not wired (existing auth is email/password only; no OAuth in current stack).
