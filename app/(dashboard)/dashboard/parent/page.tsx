// app/(dashboard)/dashboard/parent/page.tsx
// Parent view. Guarded by the segment layout (parents/admins only). Shows the
// real children registered at sign-up and the live classes offered for each
// child's grade — no fabricated attendance/billing data.
import { requireRole } from '@/lib/auth/guards';
import {
  getChildrenForParent,
  getClassesByGrade,
  getClassesForStudent,
  getRecordingsForStudent,
} from '@/lib/db/queries';
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
      // If the child has a linked student login, show what they are ACTUALLY
      // enrolled in. Fall back to the grade catalogue only when no account
      // exists yet, so a parent still sees what is on offer.
      const linked = k.studentUserId
        ? await getClassesForStudent(k.studentUserId)
        : null;
      const recordings = k.studentUserId
        ? await getRecordingsForStudent(k.studentUserId)
        : [];
      const classes = linked && linked.length > 0 ? linked : classesByGrade.get(k.gradeLevel) ?? [];
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
        enrolled: Boolean(k.studentUserId && linked && linked.length > 0),
        recordingCount: recordings.length,
      };
    })
  );

  return <ParentDashboardView greetingName={user.name} children={children} />;
}
