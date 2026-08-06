// app/api/cron/recordings-transfer/route.ts
// Safety-net worker for the Zoom → R2 transfer. The webhook kicks off an
// immediate transfer; this cron reclaims anything that didn't finish (timed out,
// crashed, or was never picked up) and retries — up to the per-row attempt cap.
// Schedule it every few minutes (see vercel.json).

import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron';
import { processPendingTransfers } from '@/lib/recordings/transfer';

// Give the transfer room to stream a large MP4 (Vercel Pro allows up to 300s).
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await processPendingTransfers();
  return NextResponse.json({ ok: true, ...result });
}
