// components/landing/interactive-demo.tsx
'use client';

import { useState } from 'react';
import { GRADES, type Grade } from '@/lib/content/curriculum';

// One real question per grade, chosen to show the actual difficulty ramp across
// the programme rather than three variations of the same idea.
const QUIZZES: Record<Grade, {
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}> = {
  5: {
    topic: 'Ratio & Proportion',
    question: 'A recipe uses 3 cups of flour to serve 4 people. How much flour is needed to serve 10 people?',
    options: ['6 cups', '7.5 cups', '8 cups', '9 cups'],
    correct: 1,
    explanation: 'Flour per person = 3 ÷ 4 = 0.75 cups. For 10 people: 0.75 × 10 = 7.5 cups.',
  },
  6: {
    topic: 'Linear Equations',
    question: 'Solve for x:  3x + 7 = 22',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 15'],
    correct: 1,
    explanation: '3x + 7 = 22 → 3x = 15 → x = 5. A typical BC Grade 7 class solves one-step equations; here it is multi-step, in Grade 6.',
  },
  7: {
    topic: 'Algebraic Identities',
    question: 'Expand:  (x + 5)²',
    options: ['x² + 25', 'x² + 5x + 25', 'x² + 10x + 25', 'x² + 10x + 10'],
    correct: 2,
    explanation: '(a + b)² = a² + 2ab + b², so (x + 5)² = x² + 10x + 25. Most students meet identities in high school; here it is Grade 7.',
  },
};

export function InteractiveDemo() {
  const [grade, setGrade] = useState<Grade>(6);
  const [selected, setSelected] = useState<number | null>(null);

  const quiz = QUIZZES[grade];
  const isCorrect = selected === quiz.correct;

  return (
    <section id="how-it-works" className="am-glow-top relative py-28 px-4 sm:px-6 bg-white">
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>How It Works</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Try a Question — <span className="am-text-gradient-purple">Right Now</span>
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg">
            No signup needed. Switch grades to see how fast the level climbs.
          </p>
        </div>

        <div
          className="flex gap-1 rounded-full p-1 mb-10 mx-auto w-fit"
          style={{ background: 'var(--am-bg-light)', border: '1px solid var(--am-hairline-purple)' }}
        >
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => { setGrade(g); setSelected(null); }}
              aria-pressed={grade === g}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all duration-200"
              style={
                grade === g
                  ? { background: 'var(--am-purple)', color: 'white', boxShadow: '0 6px 16px -8px rgba(118,75,162,0.7)' }
                  : { color: 'var(--am-purple)' }
              }
            >
              Grade {g}
            </button>
          ))}
        </div>

        <div
          className="rounded-[1.25rem] p-8"
          style={{ background: 'var(--am-bg-light)', border: '1px solid var(--am-hairline-purple)', boxShadow: 'var(--am-shadow-md)' }}
        >
          <div className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>
            Grade {grade} Math · {quiz.topic}
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-8">{quiz.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quiz.options.map((opt, i) => {
              const isSelected = selected === i;
              const correct = i === quiz.correct;
              let style: React.CSSProperties = { border: '2px solid #e5e7eb', background: 'white', color: '#374151' };
              if (selected !== null) {
                if (correct) style = { border: '2px solid #22c55e', background: '#f0fdf4', color: '#15803d' };
                else if (isSelected) style = { border: '2px solid #ef4444', background: '#fef2f2', color: '#b91c1c' };
              }
              return (
                <button
                  key={opt}
                  onClick={() => setSelected(i)}
                  disabled={selected !== null}
                  className="p-4 rounded-xl text-left font-medium transition-all hover:scale-[1.02] disabled:hover:scale-100"
                  style={style}
                >
                  <span className="text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <>
              <div
                className="mt-6 p-4 rounded-xl text-sm font-medium"
                style={isCorrect
                  ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                  : { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}
              >
                {isCorrect ? 'Correct. ' : 'Not quite. '}
                {quiz.explanation}
              </div>
              <div className="mt-6 text-center">
                <a href="/enquiry" className="am-btn am-btn-primary px-6 text-sm">
                  Book a free trial class
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
