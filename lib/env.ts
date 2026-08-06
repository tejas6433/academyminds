// lib/env.ts
// Fail-fast validation of required environment variables.
//
// Without this, a missing AUTH_SECRET or STRIPE_SECRET_KEY surfaces as a
// confusing runtime error deep inside a request — a parent's checkout throwing
// mid-payment rather than the deploy refusing to serve. Validating once at
// module load turns a silent production failure into a loud startup failure.
//
// Deliberately NOT validated here: the optional integrations (ZOOM_*, R2_*,
// RESEND_*). Those degrade gracefully by design — the app runs without them and
// the corresponding feature stays dormant — so requiring them would break local
// development for no safety gain.

import { z } from 'zod';

const requiredEnv = z.object({
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required (Postgres connection string).'),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters — generate with `openssl rand -hex 32`.'),
  BASE_URL: z.string().url('BASE_URL must be a full URL, e.g. https://academyminds.com'),
});

// `next build` imports server modules to collect page data, where production
// secrets are legitimately absent. Validation applies at runtime only.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase) {
  const result = requiredEnv.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `  • ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
}

/**
 * Stripe is required only where money actually moves, so it is checked at the
 * call site rather than blocking the whole app from booting.
 */
export function requireStripeEnv(): { secretKey: string } {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set — payments cannot be processed.');
  }
  return { secretKey };
}
