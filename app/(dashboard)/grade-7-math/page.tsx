// app/(dashboard)/grade-7-math/page.tsx
import type { Metadata } from 'next';
import { GradeMathPage } from '@/lib/content/grade-page';

const TITLE = 'Grade 7 Math Tutoring — Live Online Classes';
const FULL_TITLE = 'Grade 7 Math Tutoring — Live Online Classes | AcademyMinds';
const DESCRIPTION =
  'Live online Grade 7 math tutoring on the AcademyMinds accelerated curriculum — linear equations, geometry proofs and algebraic identities, 3 classes a week plus reviewed assignments. BC owned. Free trial class.';

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
    a: 'Formal congruence proofs and multi-step equations are exactly the topics that decide whether a student finds high-school math straightforward or overwhelming. We teach both in Grade 7, so there are years to consolidate before it counts.',
  },
  {
    q: 'Is there a placement test before joining?',
    a: 'The free trial class serves as the placement conversation — no separate testing, no pressure, just a real class so you and the teacher can both see the fit.',
  },
  {
    q: 'How much homework is there, and is it actually checked?',
    a: 'There is an assignment after every class — three a week — sized to take about 20–30 minutes. Every submission is reviewed and returned with feedback, not just marked complete.',
  },
];

export default function Page() {
  return (
    <GradeMathPage
      grade={7}
      intro="The bridge to high school. Linear equations, formal proofs and algebraic identities — most students meet these in high school; taught here in Grade 7, so the foundation is solid long before it matters."
      faqs={FAQS}
    />
  );
}
