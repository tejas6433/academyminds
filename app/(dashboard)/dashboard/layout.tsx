// app/(dashboard)/dashboard/layout.tsx
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--am-bg-light)' }}>
      <header className="am-glass-dark sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-5">
          <Link href="/" className="shrink-0 text-white font-bold text-lg tracking-tight">
            Academy<span style={{ color: 'var(--am-purple-light)' }}>Minds</span>
          </Link>
          <nav className="flex-1 min-w-0 flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/dashboard" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Schedule</Link>
            <Link href="/dashboard/recordings" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Recordings</Link>
            {(user.role === 'parent' || user.role === 'admin') && (
              <Link href="/dashboard/parent" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Parent View</Link>
            )}
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link href="/dashboard/teacher" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Teach</Link>
            )}
            {user.role === 'admin' && (
              <Link href="/dashboard/admin" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Admin</Link>
            )}
            <Link href="/dashboard/general" className="shrink-0 text-gray-300 hover:text-white text-sm transition-colors">Settings</Link>
          </nav>
          <div
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--am-purple)' }}
          >
            {user.email[0].toUpperCase()}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
