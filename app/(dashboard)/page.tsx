'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { CurriculumComparison } from '@/components/landing/curriculum-comparison';
import { Courses } from '@/components/landing/courses';
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
      <InteractiveDemo />
      <FoundingFamilies />
      <Pricing />
      <Footer />
    </main>
  );
}
