// app/(dashboard)/grade-6-math/page.tsx
import type { Metadata } from 'next';
import { GradeMathPage } from '@/lib/content/grade-page';

const TITLE = 'Grade 6 Math Tutoring — Live Online Classes';
const FULL_TITLE = 'Grade 6 Math Tutoring — Live Online Classes | AcademyMinds';
const DESCRIPTION =
  'Live online Grade 6 math tutoring on the Indian (CBSE/ICSE) curriculum — full algebra, data & statistics, and Python coding up to 3 years ahead of the Ontario curriculum. Small groups, real teachers, free trial class.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/grade-6-math' },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, url: '/grade-6-math' },
};

const FAQS = [
  {
    q: 'What makes Grade 6 the biggest curriculum gap year?',
    a: 'Ontario doesn’t introduce algebra or data & statistics until Grade 8. On the Indian curriculum, both are full Grade 6 chapters — a two-year gap on two major topics in the same year, which is why most families join us at this grade.',
  },
  {
    q: 'My child is strong at math but bored in school — will this challenge them?',
    a: 'That’s exactly who this is built for. Grade 6 groups move into full equations, ratios, and number theory rather than repeating material a strong student has already mastered.',
  },
  {
    q: 'Can they start mid-cohort, or only at the beginning of a term?',
    a: 'Cohorts run on a 10-month structure, but we place new students where they’ll succeed rather than making everyone wait for a fixed start date — ask us in a trial class and we’ll tell you honestly where your child fits.',
  },
  {
    q: 'Do you cover the Python side for Grade 6 specifically?',
    a: 'Yes — functions, lists and dictionaries, file I/O, and a calculator-app project, taught as a separate 2x/week course alongside math.',
  },
];

export default function Page() {
  return (
    <GradeMathPage
      grade={6}
      intro="The widest gap of any grade: full algebra and data & statistics are two full years ahead of Ontario's Grade 8 introduction. This is where most families notice their child could be doing so much more."
      faqs={FAQS}
    />
  );
}
