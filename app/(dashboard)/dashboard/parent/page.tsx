// app/(dashboard)/dashboard/parent/page.tsx
// Parent view. Guarded by the segment layout (parents/admins only). Shows the
// real children registered at sign-up and the live classes offered for each
// child's grade — no fabricated attendance/billing data.
import { requireRole } from '@/lib/auth/guards';
import { getChildrenForParent, getClassesByGrade } from '@/lib/db/queries';
import { nextClassInstance, todaysClasses } from '@/lib/schedule';
import { ParentDashboardView } from '@/components/dashboard/parent-dashboard-view';

export default async function ParentDashboard() {
  const user = await requireRole(['parent']);
  const kids = await getChildrenForParent(user.id);

  // Fetch each DISTINCT grade once. Two kids in the same grade previously ran
  // the identical query twice.
  const grades = [...new Set(kids.map((k) => k.gradeLevel))];
  const classesByGrade = new Map(
    await Promise.all(
      grades.map(async (g) => [g, await getClassesByGrade(g)] as const)
    )
  );

  const children = await Promise.all(
    kids.map(async (k) => {
      const classes = classesByGrade.get(k.gradeLevel) ?? [];
      const next = nextClassInstance(classes);
      const today = todaysClasses(classes);
      return {
        id: k.id,
        name: k.name,
        gradeLevel: k.gradeLevel,
        subjectInterest: k.subjectInterest,
        next: next ? { ...next, startsAt: next.startsAt.toISOString() } : null,
        today: today.map((c) => ({ ...c, startsAt: c.startsAt.toISOString() })),
        classCount: classes.length,
      };
    })
  );

  return <ParentDashboardView greetingName={user.name} children={children} />;
}
