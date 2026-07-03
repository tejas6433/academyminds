// app/(dashboard)/dashboard/parent/layout.tsx
// Server-side gate: only parents (and admins) may view the parent area.
import { requireRole } from '@/lib/auth/guards';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['parent']);
  return <>{children}</>;
}
