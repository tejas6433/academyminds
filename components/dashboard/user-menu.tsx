'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { signOut } from '@/app/(login)/actions';

// Account menu in the dashboard header. Signing out previously had no UI at all
// — the action existed but nothing called it, so a signed-in user had no way to
// leave. Settings moved in here to keep the top nav to actual destinations.
export function UserMenu({ email, role }: { email: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-105"
        style={{ background: 'var(--am-purple)' }}
      >
        {email[0].toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl overflow-hidden animate-fade-up z-50"
          style={{
            background: 'rgba(26,26,46,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'var(--am-shadow-xl)',
          }}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-semibold truncate">{email}</p>
            <p className="text-gray-400 text-xs mt-0.5 capitalize">{role}</p>
          </div>

          <Link
            href="/dashboard/general"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/dashboard/security"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            Password &amp; security
          </Link>

          <form action={signOut} className="border-t border-white/10">
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{ color: '#fca5a5' }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
