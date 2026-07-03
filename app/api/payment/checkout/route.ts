import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';

// Prices are in Canadian cents. Tax is added at checkout by Stripe Tax.
const PLANS: Record<string, { name: string; amount: number; interval: 'month'; intervalCount: number }> = {
  monthly: { name: 'AcademyMinds — Monthly Plan', amount: 9999, interval: 'month', intervalCount: 1 },
  quarterly: { name: 'AcademyMinds — Quarterly Plan', amount: 23999, interval: 'month', intervalCount: 3 },
};

export async function POST(request: NextRequest) {
  const { plan, email } = await request.json();

  const selected = PLANS[plan];
  if (!selected) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: typeof email === 'string' && email ? email : undefined,
    // Collect a billing address and let Stripe Tax compute GST/HST/PST per province.
    billing_address_collection: 'required',
    automatic_tax: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: 'cad',
          product_data: { name: selected.name },
          unit_amount: selected.amount,
          recurring: { interval: selected.interval, interval_count: selected.intervalCount },
          // Price is tax-exclusive; Stripe adds tax on top based on address.
          tax_behavior: 'exclusive',
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/payment`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
