// app/api/enquiry/route.ts
// Handles public trial-class enquiries: validates, stores them so they show up
// in the admin dashboard, and emails a notification so nothing gets missed.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { enquiries } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/resend';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Where new-enquiry notifications are sent. Set ENQUIRY_NOTIFY_EMAIL to an inbox
// you actually check; falls back to the support address.
const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_EMAIL || 'support@academyminds.com';

const schema = z.object({
  parentName: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(255),
  grade: z.coerce.number().int().min(5).max(7).optional(),
  interest: z.enum(['struggling', 'on-track', 'ahead']).optional(),
  message: z.string().trim().max(2000).optional(),
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export async function POST(request: NextRequest) {
  // Public, unauthenticated endpoint that costs money on every hit (email send)
  // and lands in a human inbox — cap it well below any genuine parent's usage.
  const limit = rateLimit(`enquiry:${clientIp(request.headers)}`, 5, 600);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many enquiries. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { parentName, email, grade, interest, message } = parsed.data;

  try {
    await db.insert(enquiries).values({
      parentName,
      email,
      gradeLevel: grade ?? null,
      interest: interest ?? null,
      message: message || null,
    });
  } catch (err) {
    console.error('[enquiry] failed to save:', err);
    return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 });
  }

  // Best-effort notification — never fails the submission if email is down.
  await sendEmail({
    to: NOTIFY_TO,
    subject: `New enquiry — ${parentName}${grade ? ` (Grade ${grade})` : ''}`,
    html: `
      <h2>New trial enquiry</h2>
      <p><strong>Parent:</strong> ${escapeHtml(parentName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Grade:</strong> ${grade ?? '—'}</p>
      <p><strong>Current math level:</strong> ${interest ?? '—'}</p>
      <p><strong>Message:</strong><br/>${message ? escapeHtml(message).replace(/\n/g, '<br/>') : '—'}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
