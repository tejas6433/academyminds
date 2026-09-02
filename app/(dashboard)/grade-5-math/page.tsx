// app/(dashboard)/grade-5-math/page.tsx
import type { Metadata } from 'next';
import { GradeMathPage } from '@/lib/content/grade-page';

const TITLE = 'Grade 5 Math Tutoring — Live Online Classes';
const FULL_TITLE = 'Grade 5 Math Tutoring — Live Online Classes | AcademyMinds';
const DESCRIPTION =
  'Live online Grade 5 math tutoring on the Indian (ICSE) curriculum — 3 classes a week plus a reviewed assignment after every class. Introduces algebra two years before Ontario schools. Free trial class.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/grade-5-math' },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, url: '/grade-5-math' },
};

const FAQS = [
  {
    q: 'Is my Grade 5 child ready for algebra?',
    a: 'Yes — Ontario schools don’t introduce algebra until Grade 7, but Grade 5 is exactly when the CBSE/ICSE curriculum starts variables and expressions. Kids at this age pick up the concept easily when it’s taught with the right pacing, which is what our small-group format is built for.',
  },
  {
    q: 'What if my child is behind in fractions?',
    a: 'Our first class works as a diagnostic. Teachers adjust pacing per student inside the small group rather than assuming every Grade 5 student starts at the same point.',
  },
  {
    q: 'How is this different from a generic online tutor?',
    a: 'We teach a fixed, sequenced curriculum (not ad-hoc homework help) in cohorts of 10–12 students who progress together over a 10-month term, with the same teacher throughout.',
  },
  {
    q: 'How much homework is there, and is it actually checked?',
    a: 'There is an assignment after every class — three a week — sized to take about 20–30 minutes. Every submission is reviewed and returned with feedback, not just marked complete.',
  },
];

export default function Page() {
  return (
    <GradeMathPage
      grade={5}
      intro="The year the gap opens. Grade 5 on the Indian curriculum introduces algebraic thinking and multi-step reasoning — the exact foundations every AI and STEM career is later built on, and two years before Ontario touches them."
      faqs={FAQS}
    />
  );
}
