import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/utils';
import { Cart, ICartItem } from '@/lib/models';
import { Product } from '@/lib/models';

// Get user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    let cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = { items: [], totalQuantity: 0, totalPrice: 0 };
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add item to cart or update cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity, selectedSize, selectedColor } = await request.json();

    if (!productId || !quantity || !selectedSize || !selectedColor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Get product details
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const cartItem = {
      productId: product.id,
      quantity,
      selectedSize,
      selectedColor,
      price: product.price,
      name: product.name,
      image: product.images.get(selectedColor) || Object.values(product.images)[0],
    };

    // Find or create cart
    let cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        items: [cartItem],
      });
    } else {
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        (item: ICartItem) =>
          item.productId === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push(cartItem);
      }
    }

    await cart.save();
    
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, selectedSize, selectedColor, quantity } = await request.json();

    await connectToDatabase();
    
    const cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: ICartItem) =>
        item.productId === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    await Cart.findOneAndDelete({ userId: session.user.id });
    
    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}