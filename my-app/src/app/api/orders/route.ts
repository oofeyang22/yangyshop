import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';
import { Cart } from '@/lib/models';

// Create order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, paymentInfo, discount = 0, shippingFee = 10 } = await request.json();

    if (!shippingAddress || !paymentInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = cart.totalPrice;
    const total = subtotal - discount + shippingFee;

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = new Order({
      orderId,
      userId: session.user.id,
      items: cart.items,
      shippingAddress,
      paymentInfo: {
        ...paymentInfo,
        status: 'pending',
      },
      subtotal,
      discount,
      shippingFee,
      total,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await order.save();

    // Clear the cart after successful order creation
    await Cart.findOneAndDelete({ userId: session.user.id });

    return NextResponse.json({ 
      success: true, 
      order,
      message: 'Order created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    await connectToDatabase();
    
    let query: any = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}