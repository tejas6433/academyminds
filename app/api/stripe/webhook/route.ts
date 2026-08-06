import Stripe from 'stripe';
import {
  handleSubscriptionChange,
  stripe,
  syncSubscriptionFromStripe,
} from '@/lib/payments/stripe';
import { sendEmail } from '@/lib/email/resend';
import { NextRequest, NextResponse } from 'next/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Where new-payment alerts go. Reuses the enquiry notify inbox.
const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_EMAIL || 'support@academyminds.com';

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

        // Alert admin: a new customer just paid. Best-effort — never fail the
        // webhook over an email. Prompts you to create the student account.
        const amount = session.amount_total != null ? `$${(session.amount_total / 100).toFixed(2)} ${(session.currency ?? '').toUpperCase()}` : '';
        await sendEmail({
          to: NOTIFY_TO,
          subject: `New paid subscription — ${session.customer_details?.email ?? session.customer_email ?? 'customer'}`,
          html: `
            <h2>New AcademyMinds subscription 🎉</h2>
            <p><strong>Email:</strong> ${session.customer_details?.email ?? session.customer_email ?? '—'}</p>
            <p><strong>Name:</strong> ${session.customer_details?.name ?? '—'}</p>
            <p><strong>Amount:</strong> ${amount || '—'}</p>
            <p>Next step: create the student account from the admin Customers page.</p>
          `,
        });
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
