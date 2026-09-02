// lib/content/curriculum.ts
// Single source of truth for curriculum content, shared by the landing-page
// components and the grade-level SEO pages. Math-only: the coding track was
// discontinued, so every marketing surface reads from here and stays in sync.

export type Grade = 5 | 6 | 7;

export const GRADES: Grade[] = [5, 6, 7];

/** Live classes per week. Practice assignments run on the days between. */
export const CLASSES_PER_WEEK = 3;

// Depth comparison: what a student typically covers at this grade in a BC
// classroom vs. what we cover. Deliberately framed by DEPTH rather than
// "province X doesn't teach this until Grade Y" — those claims vary by school
// and are hard to substantiate, and comparative advertising has to be provable.
export interface CurriculumRow {
  topic: string;
  typical: string;
  ours: string;
  advantage: string;
}

export const CURRICULUM_DATA: Record<Grade, CurriculumRow[]> = {
  5: [
    { topic: 'Fractions & Decimals', typical: 'Compare and order fractions', ours: 'All four operations, plus ratio', advantage: 'Deeper' },
    { topic: 'Early Algebra', typical: 'Patterns and number rules', ours: 'Variables, expressions, one-step equations', advantage: 'Ahead' },
    { topic: 'Geometry', typical: 'Naming and classifying shapes', ours: 'Area, perimeter, angle sum, coordinate grid', advantage: 'Deeper' },
    { topic: 'Factors & Multiples', typical: 'Multiples and simple factors', ours: 'HCF, LCM, full divisibility rules', advantage: 'Deeper' },
    { topic: 'Problem Solving', typical: 'Single-step word problems', ours: 'Multi-step, written reasoning required', advantage: 'Deeper' },
  ],
  6: [
    { topic: 'Algebra', typical: 'Equality with balance models', ours: 'Multi-step equations, brackets, both sides', advantage: 'Ahead' },
    { topic: 'Fractions Mastery', typical: 'Operations with like denominators', ours: 'Complex fractions, ratio, proportion', advantage: 'Deeper' },
    { topic: 'Data & Statistics', typical: 'Reading and building graphs', ours: 'Mean, median, mode + interpretation', advantage: 'Ahead' },
    { topic: 'Ratio & Percentage', typical: 'Introductory percentage', ours: 'Full chapter with real applications', advantage: 'Deeper' },
    { topic: 'Integers', typical: 'Introducing negative numbers', ours: 'All four operations, fluent', advantage: 'Deeper' },
  ],
  7: [
    { topic: 'Linear Equations', typical: 'One-step, whole-number coefficients', ours: 'Multi-step, fractions, inequalities', advantage: 'Ahead' },
    { topic: 'Geometry Proofs', typical: 'Angle and shape properties', ours: 'Formal congruence proofs (SSS, SAS, ASA)', advantage: 'Ahead' },
    { topic: 'Financial Math', typical: 'Percentage of a quantity', ours: 'Profit, loss, discount, simple interest', advantage: 'Deeper' },
    { topic: 'Algebraic Identities', typical: 'Not typically covered', ours: 'Expansion and factorisation', advantage: 'Ahead' },
    { topic: 'Exponents & Powers', typical: 'Squares and square roots', ours: 'Full laws of exponents, standard form', advantage: 'Ahead' },
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
