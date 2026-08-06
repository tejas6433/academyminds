'use client';

import { useState } from 'react';
import { Hero } from '@/components/landing/hero';
import { CurriculumComparison } from '@/components/landing/curriculum-comparison';
import { Courses } from '@/components/landing/courses';

type Grade = 5 | 6 | 7;

// The only interactive part of the landing page: a shared grade selector that
// drives the hero, curriculum comparison, and course list. Isolating it here
// keeps the rest of the page (demo, pricing, footer) as server components, so
// they ship zero client JS.
export function GradeExplorer() {
  const [grade, setGrade] = useState<Grade>(6);

  return (
    <>
      <Hero selectedGrade={grade} onGradeChange={setGrade} />
      <CurriculumComparison selectedGrade={grade} onGradeChange={setGrade} />
      <Courses selectedGrade={grade} />
    </>
  );
}
