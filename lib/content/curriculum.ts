// lib/content/curriculum.ts
// Single source of truth for curriculum content, shared by the landing-page
// components and the grade-level SEO pages. Math-only: the coding track was
// discontinued, so every marketing surface reads from here and stays in sync.

export type Grade = 5 | 6 | 7;

export const GRADES: Grade[] = [5, 6, 7];

/** Live classes per week. Practice assignments run on the days between. */
export const CLASSES_PER_WEEK = 3;

export interface CurriculumRow {
  topic: string;
  canadian: string;
  indian: string;
  advantage: string;
}

export const CURRICULUM_DATA: Record<Grade, CurriculumRow[]> = {
  5: [
    { topic: 'Fractions & Decimals', canadian: 'Basic fractions, Grade 5', indian: 'Advanced operations + ratios', advantage: '+1.5 years' },
    { topic: 'Algebra Concepts', canadian: 'Not introduced until Grade 7', indian: 'Variables & expressions', advantage: '+2 years' },
    { topic: 'Geometry', canadian: 'Basic shapes', indian: 'Area, perimeter, coordinate grids', advantage: '+1 year' },
    { topic: 'Factors & Multiples', canadian: 'Introduced Grade 6', indian: 'HCF, LCM, divisibility mastery', advantage: '+1 year' },
    { topic: 'Problem-Solving', canadian: 'Word problems, basic', indian: 'Multi-step logical reasoning', advantage: '+2 years' },
  ],
  6: [
    { topic: 'Algebra', canadian: 'Not introduced until Grade 8', indian: 'Full chapter: equations & expressions', advantage: '+2 years' },
    { topic: 'Fractions Mastery', canadian: 'Basic operations, Grade 6', indian: 'Complex fractions + ratios', advantage: '+1.5 years' },
    { topic: 'Data & Statistics', canadian: 'Not until Grade 8', indian: 'Mean, median, mode, graphs', advantage: '+2 years' },
    { topic: 'Ratio & Percentage', canadian: 'Grade 7–8', indian: 'Full chapter with applications', advantage: '+1.5 years' },
    { topic: 'Number Theory', canadian: 'LCM/GCF Grade 7', indian: 'Primes, factors, divisibility rules', advantage: '+1 year' },
  ],
  7: [
    { topic: 'Algebra', canadian: 'Intro algebra, Grade 8', indian: 'Linear equations, inequalities', advantage: '+1 year' },
    { topic: 'Geometry Proofs', canadian: 'Not until Grade 9', indian: 'Triangle properties, congruence', advantage: '+2 years' },
    { topic: 'Percentages & Interest', canadian: 'Grade 8–9', indian: 'Full financial math', advantage: '+1.5 years' },
    { topic: 'Algebraic Identities', canadian: 'Grade 9–10', indian: 'Expansion & factorisation', advantage: '+2 years' },
    { topic: 'Exponents & Powers', canadian: 'Grade 9', indian: 'Laws of exponents', advantage: '+2 years' },
  ],
};

export interface CourseInfo {
  subject: string;
  icon: string;
  topics: string[];
  frequency: string;
}

export const COURSES: Record<Grade, CourseInfo> = {
  5: {
    subject: 'Math — Grade 5',
    icon: '🔢',
    frequency: '3× per week',
    topics: ['Advanced Fractions & Decimals', 'Introduction to Algebra', 'Geometry & Measurement', 'Factors, HCF & LCM', 'Multi-Step Problem Solving'],
  },
  6: {
    subject: 'Math — Grade 6',
    icon: '🔢',
    frequency: '3× per week',
    topics: ['Full Algebra Chapter', 'Ratios, Proportions & Percentage', 'Data & Statistics', 'Integers & Number Theory', 'Geometric Constructions'],
  },
  7: {
    subject: 'Math — Grade 7',
    icon: '🔢',
    frequency: '3× per week',
    topics: ['Linear Equations & Inequalities', 'Geometry & Congruence Proofs', 'Algebraic Identities', 'Exponents & Powers', 'Financial Math & Percentages'],
  },
};
