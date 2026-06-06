import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';
import { Cart } from '@/lib/models';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId, paymentMethodId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
    }

    await connectToDatabase();

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // Parse metadata
    const orderData = JSON.parse(paymentIntent.metadata.orderData);
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get payment method details
    let cardLast4 = '';
    if (paymentMethodId) {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      if (paymentMethod.card) {
        cardLast4 = paymentMethod.card.last4;
      }
    }

    // Create order
    const order = new Order({
      orderId,
      userId: session.user.id,
      items: cart.items,
      shippingAddress: orderData.shippingAddress,
      paymentInfo: {
        method: 'card',
        cardLast4,
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
      },
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      shippingFee: orderData.shippingFee,
      total: paymentIntent.amount / 100,
      status: 'processing',
      paymentStatus: 'paid',
    });

    await order.save();

    // Clear the cart after successful order creation
    await Cart.findOneAndDelete({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order from payment:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}