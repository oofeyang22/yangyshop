import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/utils';
import { Cart, ICartItem } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, selectedSize, selectedColor } = await request.json();

    await connectToDatabase();
    
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: ICartItem) =>
        !(item.productId === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor)
    );

    await cart.save();
    
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}