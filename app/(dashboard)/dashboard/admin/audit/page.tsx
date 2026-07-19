// app/(dashboard)/dashboard/admin/audit/page.tsx
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';
import { getAuditLogs } from '@/lib/db/queries';

const ACTION_LABELS: Record<string, string> = {
  'role.change': 'Changed role',
  'class.create': 'Created class',
  'class.assign_teacher': 'Assigned teacher',
  'enrollment.create': 'Enrolled student',
  'recording.publish': 'Published recording',
  'recording.hide': 'Hid recording',
};

export default async function AuditPage() {
  await requireRole(['admin']);
  const logs = await getAuditLogs(150);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Security</p>
          <h1 className="am-heading text-2xl" style={{ color: 'var(--am-navy)' }}>Audit log</h1>
          <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Every sensitive action, most recent first.</p>
        </div>
        <Link href="/dashboard/admin" className="text-sm font-medium" style={{ color: 'var(--am-purple)' }}>← Admin</Link>
      </div>

      <div className="am-card overflow-x-auto">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-[var(--am-ink-500)] text-sm">No activity recorded yet.</p>
        ) : (
          <table className="w-full text-left min-w-[640px] text-sm">
            <thead>
              <tr className="am-eyebrow text-[var(--am-ink-400)]">
                <th className="py-3 px-4">When</th>
                <th className="py-3 px-4">Who</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 align-middle">
                  <td className="py-3 px-4 text-[var(--am-ink-500)] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[var(--am-ink-700)]">{l.actorName ?? l.actorEmail ?? 'System'}</td>
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--am-navy)' }}>
                    {ACTION_LABELS[l.action] ?? l.action}
                  </td>
                  <td className="py-3 px-4 text-[var(--am-ink-500)]">
                    {l.targetType ? `${l.targetType} #${l.targetId ?? '—'}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-[var(--am-ink-400)] text-xs font-mono">
                    {l.metadata ? JSON.stringify(l.metadata) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
