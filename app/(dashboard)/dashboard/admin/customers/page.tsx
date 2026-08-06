// app/(dashboard)/dashboard/admin/customers/page.tsx
// Admin view of paying customers (synced from Stripe) with a one-click tool to
// create each child's student login + enroll + email the parent.
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';
import { getSubscriptions, getAllClasses } from '@/lib/db/queries';
import { CreateStudentForm } from '@/components/dashboard/create-student-form';

const ACTIVE = ['active', 'trialing'];

export default async function CustomersPage() {
  await requireRole(['admin']);
  const [subs, classes] = await Promise.all([getSubscriptions(200), getAllClasses()]);
  const classOptions = classes.map((c) => ({ id: c.id, name: `${c.name} (Grade ${c.gradeLevel})` }));

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Billing</p>
          <h1 className="am-heading text-2xl" style={{ color: 'var(--am-navy)' }}>Customers</h1>
          <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Paying parents (synced from Stripe). Create each child&apos;s login here.</p>
        </div>
        <Link href="/dashboard/admin" className="text-sm font-medium" style={{ color: 'var(--am-purple)' }}>← Admin</Link>
      </div>

      {subs.length === 0 ? (
        <div className="am-card p-10 text-center">
          <p className="text-[var(--am-ink-500)]">No customers yet. Paid subscriptions appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => {
            const active = ACTIVE.includes(s.status);
            return (
              <div key={s.id} className="am-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <a href={`mailto:${s.email}`} className="font-semibold underline break-all" style={{ color: 'var(--am-navy)' }}>{s.email}</a>
                    <p className="text-xs text-[var(--am-ink-400)] mt-0.5">
                      {s.planName ?? 'Subscription'} · joined {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                    style={active
                      ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                      : { background: 'rgba(107,114,128,0.12)', color: '#6b7280' }}
                  >
                    {s.status}
                  </span>
                </div>
                <CreateStudentForm parentEmail={s.email} classes={classOptions} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
