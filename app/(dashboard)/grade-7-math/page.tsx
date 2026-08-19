// app/(dashboard)/grade-7-math/page.tsx
import type { Metadata } from 'next';
import { GradeMathPage } from '@/lib/content/grade-page';

const TITLE = 'Grade 7 Math Tutoring — Live Online Classes';
const FULL_TITLE = 'Grade 7 Math Tutoring — Live Online Classes | AcademyMinds';
const DESCRIPTION =
  'Live online Grade 7 math tutoring on the Indian (CBSE/ICSE) curriculum — linear equations, geometry proofs, and object-oriented Python, up to 3 years ahead of the Ontario curriculum. Small groups, free trial class.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/grade-7-math' },
  openGraph: { title: FULL_TITLE, description: DESCRIPTION, url: '/grade-7-math' },
};

const FAQS = [
  {
    q: 'Is Grade 7 too late to start?',
    a: 'No — it’s our most common starting grade. Students arrive with different foundations, and our teachers place each child correctly within the small group rather than assuming a fixed starting point.',
  },
  {
    q: 'How does this prepare my child for high school math?',
    a: 'Geometry proofs and linear equations — both taught in Grade 7 here, not until Grade 9 in Ontario — are exactly the topics that determine whether a student finds Grade 9 math easy or overwhelming.',
  },
  {
    q: 'What does the Grade 7 coding course cover?',
    a: 'Object-oriented programming: classes and objects, working with APIs and JSON, small web projects, and a final project where each student builds a simple game in Python.',
  },
  {
    q: 'Is there a placement test before joining?',
    a: 'The free trial class serves as the placement conversation — no separate testing, no pressure, just a real class so you and the teacher can both see the fit.',
  },
];

export default function Page() {
  return (
    <GradeMathPage
      grade={7}
      intro="The bridge to high school math. Grade 7 here covers linear equations, geometry proofs, and full financial math — material Ontario students won't see until Grade 9, giving your child a real head start into secondary school."
      faqs={FAQS}
    />
  );
}
