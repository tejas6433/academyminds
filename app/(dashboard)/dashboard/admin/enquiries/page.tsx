// app/(dashboard)/dashboard/admin/enquiries/page.tsx
// Admin view of trial-class enquiries submitted from the public /enquiry form.
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';
import { getEnquiries } from '@/lib/db/queries';

// Current values first; the three legacy subject values are kept so enquiries
// captured before the math-only switch still render as something meaningful.
const INTEREST_LABEL: Record<string, string> = {
  struggling: 'Struggling',
  'on-track': 'Doing okay',
  ahead: 'Ahead & bored',
  math: 'Math (legacy)',
  coding: 'Coding (legacy)',
  both: 'Both (legacy)',
};

export default async function EnquiriesPage() {
  await requireRole(['admin']);
  const rows = await getEnquiries(200);

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="am-eyebrow mb-2" style={{ color: 'var(--am-purple)' }}>Leads</p>
          <h1 className="am-heading text-2xl" style={{ color: 'var(--am-navy)' }}>Inquiries</h1>
          <p className="text-[var(--am-ink-500)] text-sm mt-1.5">Trial-class enquiries from the website, most recent first.</p>
        </div>
        <Link href="/dashboard/admin" className="text-sm font-medium" style={{ color: 'var(--am-purple)' }}>← Admin</Link>
      </div>

      {rows.length === 0 ? (
        <div className="am-card p-10 text-center">
          <p className="text-[var(--am-ink-500)]">No enquiries yet. They&apos;ll appear here when parents submit the trial form.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => (
            <div key={e.id} className="am-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold" style={{ color: 'var(--am-navy)' }}>{e.parentName}</p>
                  <a href={`mailto:${e.email}`} className="text-sm underline break-all" style={{ color: 'var(--am-purple)' }}>{e.email}</a>
                </div>
                <div className="text-xs text-[var(--am-ink-400)] whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap text-xs">
                {e.gradeLevel ? (
                  <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(26,26,46,0.07)', color: 'var(--am-navy)' }}>Grade {e.gradeLevel}</span>
                ) : null}
                {e.interest ? (
                  <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(118,75,162,0.1)', color: 'var(--am-purple)' }}>{INTEREST_LABEL[e.interest] ?? e.interest}</span>
                ) : null}
              </div>
              {e.message ? (
                <p className="text-sm text-[var(--am-ink-700)] mt-3 whitespace-pre-wrap">{e.message}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
