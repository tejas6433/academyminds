// app/(dashboard)/dashboard/admin/page.tsx
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { users as usersTable } from '@/lib/db/schema';
import { isNull } from 'drizzle-orm';
import {
  getAllClasses,
  getUsersByRole,
  getPlatformStats,
} from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/guards';
import { AdminClassForm } from '@/components/dashboard/admin-class-form';
import { AdminUserRow } from '@/components/dashboard/admin-user-row';
import { AddTeacherForm } from '@/components/dashboard/add-teacher-form';
import { DeleteClassButton } from '@/components/dashboard/delete-class-button';
import { AdminZoomCell } from '@/components/dashboard/admin-zoom-cell';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ICON = 'h-5 w-5';
const StatIcon = ({ kind }: { kind: string }) => {
  const common = { className: ICON, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'students': return <svg {...common}><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 2 6 2s6-1 6-2v-5"/></svg>;
    case 'teachers': return <svg {...common}><circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"/></svg>;
    case 'parents': return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/></svg>;
    case 'classes': return <svg {...common}><path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5z"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5z"/></svg>;
    case 'recordings': return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/></svg>;
    default: return null;
  }
};
const SubjectMark = ({ subject }: { subject: string }) => (
  <span
    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold align-middle mr-2"
    style={subject === 'math'
      ? { background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }
      : { background: 'rgba(26,26,46,0.07)', color: 'var(--am-navy)' }}
    aria-hidden
  >
    {subject === 'math' ? 'Σ' : '{}'}
  </span>
);

export default async function AdminDashboard() {
  await requireRole(['admin']);

  const [stats, allClasses, teachers, allUsers] = await Promise.all([
    getPlatformStats(),
    getAllClasses(),
    getUsersByRole('teacher'),
    db.select().from(usersTable).where(isNull(usersTable.deletedAt)),
  ]);

  const statCards = [
    { label: 'Students', value: stats.students, kind: 'students' },
    { label: 'Teachers', value: stats.teachers, kind: 'teachers' },
    { label: 'Parents', value: stats.parents, kind: 'parents' },
    { label: 'Classes', value: stats.classes, kind: 'classes' },
    { label: 'Recordings', value: stats.recordings, kind: 'recordings' },
  ];

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Admin</p>
          <h1 className="am-heading text-3xl" style={{ color: 'var(--am-navy)' }}>
            Dashboard
          </h1>
          <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Manage classes, teachers, students, and roles.</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <Link
            href="/dashboard/admin/customers"
            className="am-btn px-4 text-sm"
            style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-ink-700)' }}
          >
            Customers
          </Link>
          <Link
            href="/dashboard/admin/enquiries"
            className="am-btn px-4 text-sm"
            style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-ink-700)' }}
          >
            Inquiries
          </Link>
          <Link
            href="/dashboard/admin/audit"
            className="am-btn px-4 text-sm"
            style={{ border: '1px solid var(--am-hairline-strong)', color: 'var(--am-ink-700)' }}
          >
            Audit log
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="am-card am-card-hover p-5 flex flex-col gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'rgba(118,75,162,0.09)', color: 'var(--am-purple)' }}>
              <StatIcon kind={s.kind} />
            </span>
            <div>
              <div className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--am-navy)' }}>{s.value}</div>
              <div className="text-[var(--am-ink-400)] text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Classes */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="am-heading text-lg font-bold" style={{ color: 'var(--am-navy)' }}>Classes</h2>
        <AdminClassForm teachers={teachers.map((t) => ({ id: t.id, name: t.name, email: t.email }))} />
      </div>

      <div className="am-card overflow-hidden mb-10">
        {allClasses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[var(--am-ink-500)] text-sm">No classes yet. Create your first class above.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="am-eyebrow text-[var(--am-ink-400)]" style={{ background: 'rgba(118,75,162,0.03)' }}>
                <th className="py-3.5 px-5 font-bold">Class</th>
                <th className="py-3.5 px-5 font-bold">Grade</th>
                <th className="py-3.5 px-5 font-bold">Teacher</th>
                <th className="py-3.5 px-5 font-bold">Schedule</th>
                <th className="py-3.5 px-5 font-bold">Zoom</th>
                <th className="py-3.5 px-5 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {allClasses.map((c) => (
                <tr key={c.id} className="text-sm transition-colors hover:bg-[rgba(118,75,162,0.025)]" style={{ borderTop: '1px solid var(--am-hairline)' }}>
                  <td className="py-3.5 px-5 font-semibold" style={{ color: 'var(--am-navy)' }}>
                    <SubjectMark subject={c.subject} />{c.name}
                  </td>
                  <td className="py-3.5 px-5 text-[var(--am-ink-500)]">{c.gradeLevel}</td>
                  <td className="py-3.5 px-5 text-[var(--am-ink-500)]">{c.teacherName}</td>
                  <td className="py-3.5 px-5 text-[var(--am-ink-500)]">{DAY_NAMES[c.dayOfWeek]} {c.startTimeUtc.slice(0, 5)}</td>
                  <td className="py-3.5 px-5">
                    <AdminZoomCell classId={c.id} hasMeeting={Boolean(c.zoomMeetingId)} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <DeleteClassButton classId={c.id} className={c.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Users & roles */}
      <h2 className="am-heading text-lg font-bold mb-3" style={{ color: 'var(--am-navy)' }}>Users &amp; Roles</h2>
      <div className="mb-3"><AddTeacherForm /></div>
      <div className="am-card overflow-x-auto">
        <table className="w-full text-left min-w-[480px]">
          <thead>
            <tr className="am-eyebrow text-[var(--am-ink-400)]" style={{ background: 'rgba(118,75,162,0.03)' }}>
              <th className="py-3.5 px-5 font-bold">Name</th>
              <th className="py-3.5 px-5 font-bold">Email</th>
              <th className="py-3.5 px-5 font-bold">Role</th>
              <th className="py-3.5 px-5 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <AdminUserRow key={u.id} user={{ id: u.id, name: u.name, email: u.email, role: u.role }} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
