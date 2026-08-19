// app/(dashboard)/grade-5-math/page.tsx
import type { Metadata } from 'next';
import { GradeMathPage } from '@/lib/content/grade-page';

const TITLE = 'Grade 5 Math Tutoring — Live Online Classes';
const FULL_TITLE = 'Grade 5 Math Tutoring — Live Online Classes | AcademyMinds';
const DESCRIPTION =
  'Live online Grade 5 math tutoring on the Indian (CBSE/ICSE) curriculum — introducing algebra and Python coding up to 3 years ahead of the Ontario curriculum. Small groups, real teachers, free trial class.';

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
    q: 'Is coding taught alongside math, or separately?',
    a: 'Separately, as its own 2x/week course — Python fundamentals, variables, and conditional logic. Most families enroll in both, but math and coding can be taken independently.',
  },
  {
    q: 'How is this different from a generic online tutor?',
    a: 'We teach a fixed, sequenced curriculum (not ad-hoc homework help) in cohorts of 10–12 students who progress together over a 10-month term, with the same teacher throughout.',
  },
];

export default function Page() {
  return (
    <GradeMathPage
      grade={5}
      intro="The transition year where the gap starts opening. Grade 5 on the Indian curriculum introduces algebra concepts and real coding fundamentals — up to two years before Ontario schools touch either."
      faqs={FAQS}
    />
  );
}
