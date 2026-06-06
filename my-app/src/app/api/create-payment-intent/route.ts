import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/utils';
import { Cart } from '@/lib/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, discount = 0, shippingFee = 10 } = await request.json();

    await connectToDatabase();
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const total = Math.round((subtotal - discount + shippingFee) * 100); // Convert to cents

    // Create line items for Stripe
    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `Size: ${item.selectedSize}, Color: ${item.selectedColor}`,
          images: [item.image.startsWith('http') ? item.image : `${process.env.NEXTAUTH_URL}${item.image}`],
          metadata: {
            productId: item.productId.toString(),
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if needed
    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping Fee',
          },
          unit_amount: shippingFee * 100,
        },
        quantity: 1,
      });
    }

    // Add discount as negative line item if applicable
    if (discount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Discount',
          },
          unit_amount: -Math.round(discount * 100),
        },
        quantity: 1,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      metadata: {
        userId: session.user.id,
        orderData: JSON.stringify({
          shippingAddress,
          discount,
          shippingFee,
          subtotal,
        }),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}