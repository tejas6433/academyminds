// app/api/health/route.ts
// Operational health check. Protected by CRON_SECRET because it reveals
// infrastructure detail. Deliberately reports the database HOST and PORT but
// never the user or password, so it is safe to read while debugging a live
// incident.
import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function describeUrl(raw: string | undefined) {
  if (!raw) return { set: false as const };
  try {
    const u = new URL(raw);
    return {
      set: true as const,
      host: u.hostname,
      port: u.port || '(default)',
      database: u.pathname.replace('/', '') || '(none)',
      // Username shape matters for Supabase poolers (postgres.<ref>), so report
      // whether it looks right without exposing the value itself.
      usernameHasProjectRef: u.username.includes('.'),
      passwordPresent: Boolean(u.password),
      passwordLooksLikePlaceholder: /\[|\]/.test(decodeURIComponent(u.password || '')),
      mode: u.port === '6543' ? 'transaction' : u.port === '5432' ? 'session/direct' : 'unknown',
    };
  } catch {
    return { set: true as const, parseError: 'POSTGRES_URL is not a valid URL' };
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connection = describeUrl(process.env.POSTGRES_URL);

  let database: { ok: boolean; error?: string; enquiryCount?: number } = { ok: false };
  try {
    const rows = await db.execute(sql`select count(*)::int as n from enquiries`);
    const n = (rows as unknown as { n: number }[])[0]?.n;
    database = { ok: true, enquiryCount: n };
  } catch (err) {
    database = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    connection,
    database,
    env: {
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      baseUrl: process.env.BASE_URL ?? null,
    },
    // Recording pipeline config. A recording stuck at status=pending with
    // transfer_attempts=0 means the transfer skipped before claiming the row,
    // which is exactly what happens when R2 is not configured on this runtime.
    recordingPipeline: {
      r2: {
        accountId: Boolean(process.env.R2_ACCOUNT_ID),
        accessKeyId: Boolean(process.env.R2_ACCESS_KEY_ID),
        secretAccessKey: Boolean(process.env.R2_SECRET_ACCESS_KEY),
        bucket: process.env.R2_BUCKET ?? null,
        configured:
          Boolean(process.env.R2_ACCOUNT_ID) &&
          Boolean(process.env.R2_ACCESS_KEY_ID) &&
          Boolean(process.env.R2_SECRET_ACCESS_KEY) &&
          Boolean(process.env.R2_BUCKET),
      },
      zoom: {
        accountId: Boolean(process.env.ZOOM_ACCOUNT_ID),
        clientId: Boolean(process.env.ZOOM_CLIENT_ID),
        clientSecret: Boolean(process.env.ZOOM_CLIENT_SECRET),
        webhookSecret: Boolean(process.env.ZOOM_WEBHOOK_SECRET_TOKEN),
      },
      hasCronSecret: Boolean(process.env.CRON_SECRET),
    },
  });
}
