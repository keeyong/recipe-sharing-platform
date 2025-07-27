import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  createSubscriptionRecord, 
  updateSubscriptionStatus, 
  createPaymentRecord 
} from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const customer = await stripe.customers.retrieve(session.customer);
          
          await createSubscriptionRecord(
            session.client_reference_id,
            session.line_items.data[0].price.id,
            subscription.id,
            customer.id
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        await updateSubscriptionStatus(
          subscription.id,
          subscription.status,
          new Date(subscription.current_period_end * 1000).toISOString()
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        await updateSubscriptionStatus(subscription.id, 'canceled');
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        if (invoice.subscription) {
          await createPaymentRecord(
            invoice.customer,
            invoice.subscription,
            null,
            invoice.id,
            invoice.amount_paid,
            'succeeded',
            invoice.payment_method
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        
        if (invoice.subscription) {
          await createPaymentRecord(
            invoice.customer,
            invoice.subscription,
            null,
            invoice.id,
            invoice.amount_due,
            'failed',
            invoice.payment_method
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 