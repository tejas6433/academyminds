// app/api/cron/recordings-retention/route.ts
// Daily job: purge recordings past their 30-day expiry (deletes the R2 object
// and the DB row). See lib/recordings/retention.ts.

import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron';
import { purgeExpiredRecordings } from '@/lib/recordings/retention';

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await purgeExpiredRecordings();
  return NextResponse.json({ ok: true, ...result });
}
