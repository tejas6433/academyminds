import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/payments/stripe';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Prices are in Canadian cents, tax-inclusive (no tax added at checkout).
// Deliberately a Map, not an object literal: an object literal inherits from
// Object.prototype, so PLANS["__proto__"] and PLANS["constructor"] both return
// truthy values and slip past a `!selected` guard, reaching the Stripe call
// with undefined name/amount. A Map has no prototype chain to walk.
const PLANS = new Map<string, { name: string; amount: number; interval: 'month'; intervalCount: number }>([
  ['monthly', { name: 'AcademyMinds — Monthly Plan', amount: 9999, interval: 'month', intervalCount: 1 }],
  ['quarterly', { name: 'AcademyMinds — Quarterly Plan ($79.99/mo billed quarterly)', amount: 23997, interval: 'month', intervalCount: 3 }],
]);

// Validate at the boundary so only known plan ids reach the lookup at all.
const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'quarterly']),
  email: z.string().email().max(255).optional(),
});

export async function POST(request: NextRequest) {
  // Unauthenticated endpoint that calls the Stripe API on every hit — throttle
  // so it can't be used to spray sessions against our Stripe account.
  const limit = rateLimit(`checkout:${clientIp(request.headers)}`, 10, 600);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  const { plan, email } = parsed.data;

  const selected = PLANS.get(plan);
  if (!selected) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: selected.name },
            unit_amount: selected.amount,
            recurring: { interval: selected.interval, interval_count: selected.intervalCount },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/payment`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // A Stripe outage or misconfigured key must not surface as an unhandled 500
    // to a parent trying to pay.
    console.error('[checkout] Stripe session creation failed:', err);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 502 }
    );
  }
}
