// components/landing/interactive-demo.tsx
'use client';

import { useState } from 'react';

const MATH_QUIZ = {
  question: 'A train travels 240 km in 3 hours. What is its speed in km/h?',
  options: ['60 km/h', '80 km/h', '72 km/h', '90 km/h'],
  correct: 1,
  explanation: 'Speed = Distance ÷ Time = 240 ÷ 3 = 80 km/h',
};

const PYTHON_CODE = `# Print the 5-times table
for i in range(1, 11):
    print(f"5 × {i} = {5 * i}")`;

const PYTHON_OUTPUT = Array.from({ length: 10 }, (_, i) => `5 × ${i + 1} = ${5 * (i + 1)}`).join('\n');

export function InteractiveDemo() {
  const [tab, setTab] = useState<'math' | 'code'>('math');
  const [selected, setSelected] = useState<number | null>(null);
  const [ran, setRan] = useState(false);

  const isCorrect = selected === MATH_QUIZ.correct;

  return (
    <section id="how-it-works" className="am-glow-top relative py-28 px-4 sm:px-6 bg-white">
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>How It Works</p>
          <h2 className="am-heading text-3xl sm:text-[2.6rem] mb-4" style={{ color: 'var(--am-navy)' }}>
            Try a Lesson — <span className="am-text-gradient-purple">Right Now</span>
          </h2>
          <p className="text-[var(--am-ink-500)] text-lg">No signup needed. See how our classes actually feel.</p>
        </div>

        <div
          className="flex gap-1 rounded-full p-1 mb-10 mx-auto w-fit"
          style={{ background: 'var(--am-bg-light)', border: '1px solid var(--am-hairline-purple)' }}
        >
          {(['math', 'code'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); setRan(false); }}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all duration-200"
              style={
                tab === t
                  ? { background: 'var(--am-purple)', color: 'white', boxShadow: '0 6px 16px -8px rgba(118,75,162,0.7)' }
                  : { color: 'var(--am-purple)' }
              }
            >
              {t === 'math' ? '🔢 Math Challenge' : '💻 Code It'}
            </button>
          ))}
        </div>

        {tab === 'math' && (
          <div className="rounded-[1.25rem] p-8" style={{ background: 'var(--am-bg-light)', border: '1px solid var(--am-hairline-purple)', boxShadow: 'var(--am-shadow-md)' }}>
            <div className="am-eyebrow mb-4" style={{ color: 'var(--am-purple)' }}>
              Grade 6 Math · Word Problems
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-8">{MATH_QUIZ.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATH_QUIZ.options.map((opt, i) => {
                const isSelected = selected === i;
                const correct = i === MATH_QUIZ.correct;
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
              <div
                className="mt-6 p-4 rounded-xl text-sm font-medium"
                style={isCorrect
                  ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                  : { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}
              >
                {isCorrect ? '🎉 Correct! ' : '❌ Not quite. '}
                {MATH_QUIZ.explanation}
              </div>
            )}
            {selected !== null && (
              <div className="mt-6 text-center">
                <a href="/enquiry" className="am-btn am-btn-primary px-6 text-sm">
                  Get more like this — Enroll Free →
                </a>
              </div>
            )}
          </div>
        )}

        {tab === 'code' && (
          <div className="rounded-[1.25rem] overflow-hidden" style={{ boxShadow: 'var(--am-shadow-lg)', border: '1px solid var(--am-hairline)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#1e1e2e' }}>
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f56' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#27c93f' }} />
                </span>
                <span className="text-xs font-mono ml-1" style={{ color: '#9b9bb0' }}>times_table.py</span>
              </div>
              <button
                onClick={() => setRan(true)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-transform duration-150 hover:scale-105 active:scale-95"
                style={{ background: 'var(--am-purple)', color: '#fff' }}
              >
                ▶ Run
              </button>
            </div>
            <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto" style={{ background: '#12121f', color: '#c9d1d9' }}>
              <code>
                {PYTHON_CODE.split('\n').map((line, i) => (
                  <div key={i}>
                    <span style={{ color: '#6b7280', userSelect: 'none', marginRight: '1rem' }}>{i + 1}</span>
                    {line}
                  </div>
                ))}
              </code>
            </pre>
            {ran && (
              <div className="p-4 border-t" style={{ background: '#0d0d1a', borderColor: '#333' }}>
                <div className="text-xs font-mono mb-2" style={{ color: '#9b9bb0' }}>Output:</div>
                <pre className="text-xs font-mono leading-relaxed" style={{ color: '#4ade80' }}>{PYTHON_OUTPUT}</pre>
              </div>
            )}
            {ran && (
              <div className="p-4 text-center" style={{ background: '#12121f' }}>
                <a href="/enquiry" className="am-btn am-btn-primary px-6 text-sm">
                  Book a free trial
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
