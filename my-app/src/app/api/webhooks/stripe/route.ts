import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectToDatabase();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(failedPaymentIntent);
      break;
      
    case 'charge.refunded':
      const refund = event.data.object as Stripe.Charge;
      await handleRefund(refund);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderData = JSON.parse(paymentIntent.metadata.orderData || '{}');
    
    // Find if order already exists (in case of webhook retry)
    const existingOrder = await Order.findOne({
      'paymentInfo.stripePaymentIntentId': paymentIntent.id
    });
    
    if (existingOrder) {
      console.log('Order already exists for this payment intent');
      return;
    }

    // Get cart items (we need to fetch them again since webhook doesn't have cart)
    // You might want to store cart data in metadata or create a temp order first
    console.log('Payment succeeded for intent:', paymentIntent.id);
    
    // Here you could create a pending order or update existing pending order
    // For now, we'll log and let the frontend create the order
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed for intent:', paymentIntent.id);
  // Update order status if you have a pending order
  // You might want to notify the user
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Refund processed for charge:', charge.id);
  
  if (charge.payment_intent && typeof charge.payment_intent === 'string') {
    // Update order status to refunded
    await Order.findOneAndUpdate(
      { 'paymentInfo.stripePaymentIntentId': charge.payment_intent },
      { 
        paymentStatus: 'refunded',
        status: 'cancelled'
      }
    );
  }
}