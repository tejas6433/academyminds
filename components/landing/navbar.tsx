'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#curriculum', label: 'Curriculum' },
  { href: '#courses', label: 'Courses' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      {/* WCAG 2.4.1 (Bypass Blocks, Level A): lets keyboard and screen-reader
          users jump straight to the page content instead of tabbing the whole
          nav on every page. Visually hidden until focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold"
        style={{ background: 'var(--am-purple)', color: '#fff' }}
      >
        Skip to content
      </a>
      <nav className="am-glass-dark fixed top-0 left-0 right-0 z-50" aria-label="Main">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Academy<span style={{ color: 'var(--am-purple-light)' }}>Minds</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-gray-300/90 hover:text-white text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-[var(--am-purple-light)] after:transition-all after:duration-200 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/sign-in" className="text-gray-300/90 hover:text-white text-sm font-medium transition-colors">
            Sign in
          </Link>
          <Link href="/enquiry" className="am-btn am-btn-primary px-5 text-sm">
            Book a trial
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden px-6 py-6 flex flex-col gap-4 border-t border-white/10"
          style={{ background: 'rgba(26,26,46,0.98)' }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-white text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <Link href="/sign-in" className="text-gray-300 text-base font-medium" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/enquiry" className="am-btn am-btn-primary text-center text-sm w-full" onClick={() => setOpen(false)}>
              Book a trial
            </Link>
          </div>
        </div>
      )}
      </nav>
    </header>
  );
}
