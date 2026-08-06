import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Prices are in Canadian cents, tax-inclusive (no tax added at checkout).
const PLANS: Record<string, { name: string; amount: number; interval: 'month'; intervalCount: number }> = {
  monthly: { name: 'AcademyMinds — Monthly Plan', amount: 9999, interval: 'month', intervalCount: 1 },
  quarterly: { name: 'AcademyMinds — Quarterly Plan ($79.99/mo billed quarterly)', amount: 23997, interval: 'month', intervalCount: 3 },
};

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

  let plan: unknown;
  let email: unknown;
  try {
    ({ plan, email } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const selected = typeof plan === 'string' ? PLANS[plan] : undefined;
  if (!selected) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: typeof email === 'string' && email ? email : undefined,
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
