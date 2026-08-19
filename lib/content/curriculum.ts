// lib/content/curriculum.ts
// Single source of truth for the curriculum-gap and course content, shared by
// the landing-page components (CurriculumComparison, Courses) and the SEO
// landing pages (/grade-5-math etc). Keeping one copy means the marketing
// claims on every page always agree with each other.

export type Grade = 5 | 6 | 7;

export const GRADES: Grade[] = [5, 6, 7];

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
    { topic: 'Coding / Logic', canadian: 'Scratch (visual blocks)', indian: 'Python fundamentals', advantage: '+3 years' },
    { topic: 'Problem-Solving', canadian: 'Word problems, basic', indian: 'Multi-step logical reasoning', advantage: '+2 years' },
  ],
  6: [
    { topic: 'Algebra', canadian: 'Not introduced until Grade 8', indian: 'Full chapter: equations & expressions', advantage: '+2 years' },
    { topic: 'Fractions Mastery', canadian: 'Basic operations, Grade 6', indian: 'Complex fractions + ratios', advantage: '+1.5 years' },
    { topic: 'Data & Statistics', canadian: 'Not until Grade 8', indian: 'Mean, median, mode, graphs', advantage: '+2 years' },
    { topic: 'Coding', canadian: 'Scratch / basic HTML', indian: 'Python: loops, functions, logic', advantage: '+3 years' },
    { topic: 'Number Theory', canadian: 'LCM/GCF Grade 7', indian: 'Primes, factors, divisibility rules', advantage: '+1 year' },
  ],
  7: [
    { topic: 'Algebra', canadian: 'Intro algebra, Grade 8', indian: 'Linear equations, inequalities', advantage: '+1 year' },
    { topic: 'Geometry Proofs', canadian: 'Not until Grade 9', indian: 'Triangle properties, congruence', advantage: '+2 years' },
    { topic: 'Percentages & Interest', canadian: 'Grade 8–9', indian: 'Full financial math', advantage: '+1.5 years' },
    { topic: 'Python Coding', canadian: 'Grade 9+ elective', indian: 'Functions, lists, mini-projects', advantage: '+2 years' },
    { topic: 'Exponents & Powers', canadian: 'Grade 9', indian: 'Laws of exponents', advantage: '+2 years' },
  ],
};

export interface CourseInfo {
  subject: string;
  icon: string;
  topics: string[];
  frequency: string;
}

export const COURSES: Record<Grade, { math: CourseInfo; coding: CourseInfo }> = {
  5: {
    math: { subject: 'Math — Grade 5', icon: '🔢', frequency: '3× per week',
      topics: ['Advanced Fractions & Decimals', 'Introduction to Algebra', 'Geometry & Measurement', 'Problem Solving Strategies', 'Number Theory Basics'] },
    coding: { subject: 'Coding — Grade 5', icon: '💻', frequency: '2× per week',
      topics: ['Python Basics & Syntax', 'Variables & Data Types', 'Conditional Logic (if/else)', 'Loops & Iteration', 'Mini-Projects'] },
  },
  6: {
    math: { subject: 'Math — Grade 6', icon: '🔢', frequency: '3× per week',
      topics: ['Full Algebra Chapter', 'Ratios & Proportions', 'Data & Statistics', 'Integers & Number Theory', 'Geometric Constructions'] },
    coding: { subject: 'Coding — Grade 6', icon: '💻', frequency: '2× per week',
      topics: ['Python Functions', 'Lists & Dictionaries', 'File I/O Basics', 'Debugging Techniques', 'Build a Calculator App'] },
  },
  7: {
    math: { subject: 'Math — Grade 7', icon: '🔢', frequency: '3× per week',
      topics: ['Linear Equations & Inequalities', 'Geometry Proofs', 'Exponents & Powers', 'Financial Math & Percentages', 'Intro to Probability'] },
    coding: { subject: 'Coding — Grade 7', icon: '💻', frequency: '2× per week',
      topics: ['OOP Concepts in Python', 'Classes & Objects', 'APIs & JSON', 'Mini Web Projects', 'Final Project: Build a Game'] },
  },
};
