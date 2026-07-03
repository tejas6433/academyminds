// lib/auth/guards.ts
// Server-side authorization guards for dashboard routes. These run in Server
// Components / layouts and redirect before any protected UI is rendered.
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import type { User } from '@/lib/db/schema';

/** Where each role belongs — used to bounce users out of areas they can't access. */
export function homePathForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'teacher':
      return '/dashboard/teacher';
    case 'parent':
      return '/dashboard/parent';
    case 'student':
      return '/dashboard';
    default:
      // Legacy/unknown roles (e.g. starter 'owner'/'member') land on settings,
      // which is authenticated but not role-gated — avoids any redirect loop.
      return '/dashboard/general';
  }
}

/** Require an authenticated user. Redirects to sign-in if absent. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  return user;
}

/**
 * Require the authenticated user to hold one of `allowedRoles`.
 * - Not signed in → /sign-in
 * - Signed in but wrong role → bounced to their own home dashboard
 * Admins are implicitly allowed everywhere.
 */
export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireUser();
  if (user.role === 'admin') return user;
  if (!allowedRoles.includes(user.role)) {
    redirect(homePathForRole(user.role));
  }
  return user;
}
