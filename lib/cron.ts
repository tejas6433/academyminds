// lib/cron.ts
// Shared authorization for cron-triggered API routes. Works with Vercel Cron
// (which sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set) and
// with any external scheduler (cron-job.org, GitHub Actions) sending the same
// header — so retention/transfer jobs run on Vercel Hobby too, not just Pro.

import { NextRequest } from 'next/server';

export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed: no secret configured = no cron access
  return req.headers.get('authorization') === `Bearer ${secret}`;
}
