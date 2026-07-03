# AcademyMinds — Design Spec
**Date:** 2026-06-06  
**Status:** Approved

---

## Overview

EdTech platform for Grade 5-7 students (Canadian market) taught by Indian teaching professionals using the Indian curriculum — proven faster and more intensive than the Canadian equivalent. Subjects: Math and Coding. Model: **live scheduled classes** (not self-paced). Students must attend at a scheduled time set by the teacher.

**Target users:**
- Students (age 10-13) — join classes, track schedule
- Parents — monitor attendance, manage billing, add classes to calendar

---

## Brand

| Token | Value |
|---|---|
| Primary | `#764ba2` (purple) |
| Accent | `#ffd700` (gold) |
| Dark bg | `#1a1a2e` |
| Light bg | `#f8f6ff` |
| Gradient | `135deg, #667eea → #764ba2` |
| Font | Inter / system-ui |

**Tagline:** *India's Best Teachers. Your Child's Academic Head Start.*  
**Logo:** Provided (ruler + compass mark, blue tones) — used as-is.

---

## Page 1 — Landing Page (`/`)

### Navbar
- Logo left
- Nav links: How It Works, Courses, Teachers, Pricing
- Right: Sign In (ghost) + Enroll Now (gold filled button)
- Mobile: hamburger menu, full-screen overlay

### Section 1 — Hero
- Full-width, dark gradient background (`#1a1a2e → #0f3460`)
- Animated floating math symbols and code snippets in background (CSS keyframes)
- H1: "India's Best Teachers. Your Child's Academic Head Start."
- Sub: "Live math and coding classes for Grade 5-7 — taught by Indian professionals using a curriculum proven to be 2-3 years ahead of Canadian standards."
- **Grade selector:** [Grade 5] [Grade 6] [Grade 7] pill buttons — clicking a grade smoothly scrolls to / dynamically updates the curriculum comparison section below showing that grade's specific data
- CTAs: [Enroll Now] (gold) + [See the Curriculum Gap →] (ghost, scrolls to Section 2)
- "Be among our founding families — first 50 students get founding member pricing" banner strip below CTAs
- Below fold indicator (animated chevron)
- Mobile: single column, CTAs stack vertically

### Section 2 — The Curriculum Gap (interactive, grade-aware)
- Purple gradient background
- Headline: "Here's where your child is today — and where they'll be after AcademyMinds"
- Grade tabs at top: [Grade 5] [Grade 6] [Grade 7] — synced with hero selector, updates table on click
- Interactive comparison table per grade:

  | Topic | Canadian Curriculum | AcademyMinds (Indian) | Head Start |
  |---|---|---|---|
  | Algebra | Grade 8 | Grade 6 ✓ | +2 years |
  | Advanced Fractions | Grade 7 | Grade 5 ✓ | +2 years |
  | Python / Coding Logic | Grade 9+ | Grade 5 ✓ | +3 years |
  | Geometry Proofs | Grade 9 | Grade 7 ✓ | +2 years |
  | Data & Statistics | Grade 8 | Grade 6 ✓ | +2 years |

- Each row animates in on tab switch (slide + fade)
- "Head Start" column cells pulse gold on load
- Trust badges: "CBSE / ICSE certified teachers" — no fake stats, no client reviews
- CTA: [See Grade [X] Courses →] (updates with selected grade)

### Section 3 — Courses
- Tab switcher: Grade 5 / Grade 6 / Grade 7
- Per grade: two cards — Math track and Coding track
- Card shows: topics list, class frequency (e.g. 3x/week), teacher name, "Add to Calendar" button
- Hover: expand to show full syllabus preview

### Section 4 — Meet the Teachers
- 3-4 teacher cards in a horizontal scroll (mobile) or grid (desktop)
- Card: photo, name, qualification (e.g. "B.Ed, IIT-trained"), subject, years experience, short bio
- "Verified Indian Educator" badge on each card

### Section 5 — Founding Families Launch Offer
- Dark background section
- Headline: "Join Our Founding Families"
- Sub: "We're launching with a small cohort — first 50 families get founding member pricing, locked in forever."
- Progress bar: "X of 50 founding spots claimed" (static for now, can be dynamic later)
- 3 benefit chips: Founding price locked, Direct access to teachers, Shape the curriculum
- CTA: [Claim Your Founding Spot] (gold, large)

### Section 6 — Interactive Demo
- Light purple bg
- Headline: "Try a Lesson — Right Now"
- Two tabs: [Math Challenge] [Code It]
  - Math: animated multiple-choice question (fractions/algebra), shows correct/incorrect feedback
  - Code: simple Python snippet editor (read-only with run button), outputs result inline
- CTA below: "Loved it? Enroll your child today →"

### Section 7 — Pricing
- 3 plan cards on white bg
  - **Free Trial** — 2 free classes, no card required
  - **Monthly** — $X/month, unlimited classes, recordings, progress reports
  - **Annual** — $X/year (save 20%), all Monthly features + priority slots
- Each card: feature checklist, CTA button
- "Add to Calendar" note: "All class schedules sync to your phone's calendar automatically"

### Section 8 — Footer
- Logo + tagline
- Links: About, Courses, Teachers, Blog, Contact, Privacy, Terms
- Social icons
- "© 2026 AcademyMinds"

---

## Page 2 — Login / Sign Up (`/sign-in`, `/sign-up`)

### Layout
- Split screen (desktop): purple gradient left panel + white right panel
- Left panel: logo, tagline, animated floating elements, 1-2 parent testimonial quotes
- Right panel: form

### Sign In Form
- Toggle at top: [Student] [Parent] — changes avatar/greeting text
- Email input
- Password input + show/hide toggle
- "Forgot password?" link
- Primary CTA: "Sign In" (gold, full width)
- Divider: "or"
- Google OAuth button
- Bottom link: "New here? Enroll your child →"

### Sign Up Form
- Parent name, email, password
- Child name, grade selector (5 / 6 / 7)
- Subject interest: Math / Coding / Both
- Google OAuth option
- Terms checkbox
- CTA: "Create Account & Start Free Trial"

### Mobile
- Single column, no split — purple header strip with logo, white body below

---

## Page 3 — Student Dashboard (`/dashboard`)

### Layout
- Sidebar (desktop): logo, nav links (Schedule, Progress, Recordings, Settings), avatar + name at bottom
- Main content area
- Mobile: bottom tab bar (Schedule, Progress, Recordings, Profile)

### Hero Widget — Countdown to Next Class
- Purple gradient card, full width
- "NEXT CLASS IN" label (gold, uppercase)
- Large countdown timer: `HH:MM:SS` (live, JS-driven)
- Class name, teacher name, subject icon
- [🚀 JOIN CLASS] gold button — activates 10 min before class, disabled otherwise
- "Add to Calendar" icon button (top-right corner of widget)

### Today's Schedule
- List of today's classes in chronological order
- Each row: time, subject icon, class name, teacher, status badge (Upcoming / Live Now / Completed / Missed)
- Completed rows show "View Recording" link if recording available

### Weekly Timetable Tab
- 5-column grid (Mon–Fri)
- Cells show class blocks with color coding (purple=Math, gold=Coding)
- Click cell → class detail modal
- "Add all to Calendar" button at top right of timetable

### Stats Row
- 3 stat chips: Classes Attended, Attendance %, Current Streak (🔥)

### Sidebar Quick Links
- Next class reminder
- Latest recording
- Upcoming quiz (if any)

---

## Page 4 — Parent Dashboard (`/dashboard/parent`)

Same countdown hero, but framing is "Your child's next class".  
Additional sections:
- **Child switcher** (if multiple children enrolled)
- **Attendance report** — weekly/monthly chart
- **Billing** — current plan, next invoice, manage subscription
- **Notifications** — missed class alerts, grade reports
- **Add to Calendar** — "Sync all of [Child]'s classes to your calendar" one-click button

---

## Calendar Integration

### How It Works
- Every scheduled class has an `.ics` file generated server-side
- "Add to Calendar" buttons appear:
  1. On each course card (landing page)
  2. On the countdown hero widget (dashboard)
  3. On each class row in the timetable
  4. In the parent dashboard ("Sync All")

### Options presented on click:
A small dropdown appears with:
- 📅 Google Calendar (opens `calendar.google.com/calendar/r?action=TEMPLATE&...` with pre-filled data)
- 🍎 Apple Calendar (downloads `.ics` file — macOS/iOS handles it natively)
- 📆 Outlook (downloads `.ics` — works for Outlook and any RFC 5545-compliant app)
- 📋 Copy Link (ICS URL for manual import)

### ICS File Contents (per class)
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AcademyMinds//EN
BEGIN:VEVENT
UID:<class-id>@academyminds.com
DTSTART:<class datetime in UTC>
DTEND:<class datetime + duration>
SUMMARY:AcademyMinds — Math: Fractions (Grade 6)
DESCRIPTION:Teacher: Mr. Sharma\nJoin link: https://academyminds.com/join/<class-id>
LOCATION:https://academyminds.com/join/<class-id>
END:VEVENT
END:VCALENDAR
```

### Recurring Classes
- If a class repeats weekly, ICS includes `RRULE:FREQ=WEEKLY` so the full schedule is added in one click
- "Sync All" generates a single `.ics` with all of the student's classes for the term

---

## Interactivity & Animations

| Element | Animation |
|---|---|
| Hero background | Floating math symbols + code, CSS keyframes, subtle parallax on scroll |
| Stat counters | Count up from 0 on scroll-into-view (Intersection Observer) |
| Course cards | Lift + shadow on hover |
| Teacher cards | Horizontal scroll snap on mobile |
| Countdown timer | Live JS countdown, pulses at <5 min |
| JOIN button | Disabled + grey before window, gold + pulsing when live |
| Demo quiz | Shake animation on wrong answer, confetti on correct |

---

## Mobile Responsiveness

- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Nav → hamburger at <768px
- Split login → stacked at <768px
- Timetable → horizontal scroll at <768px
- Dashboard sidebar → bottom tab bar at <768px
- All tap targets ≥ 44px

---

## Tech Stack (existing project)

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Drizzle ORM + Postgres
- Auth: existing session-based auth in `/app/(login)/`
- No new dependencies for calendar (native `.ics` generation + Google Calendar URL params)

---

## Out of Scope (v1)

- In-app video conferencing (use external: Zoom/Google Meet link in class join URL)
- AI tutor / chatbot
- Parent-teacher messaging
- Mobile native app
