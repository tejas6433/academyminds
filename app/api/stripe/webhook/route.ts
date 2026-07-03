import Stripe from 'stripe';
import {
  handleSubscriptionChange,
  stripe,
  syncSubscriptionFromStripe,
} from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // Stripe signs the RAW body — read text(), never json(), or the signature
  // check will fail because JSON.parse re-serialization changes the bytes.
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Proves the request genuinely came from Stripe (and wasn't tampered with).
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // Fires the moment a Checkout payment completes → first record of the sub.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        if (subId) await syncSubscriptionFromStripe(subId);
        break;
      }

      // Lifecycle: created / renewed / plan-changed / canceled → keep DB in sync.
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(subscription.id);
        // Keep the template's team-billing path working too (harmless if unused).
        await handleSubscriptionChange(subscription);
        break;
      }

      default:
        // Acknowledge everything else so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe RETRIES later — better than silently losing the event.
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
