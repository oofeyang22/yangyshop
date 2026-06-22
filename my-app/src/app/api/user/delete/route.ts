import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/utils';
import { User, Cart, Order } from '@/lib/models';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const userId = session.user.id;

  // Delete the user's associated data
  await Cart.findOneAndDelete({ userId });

  // Soft-cancel open orders rather than hard-deleting (preserves records)
  await Order.updateMany(
    { userId, status: { $in: ['pending', 'processing'] } },
    { $set: { status: 'cancelled' } }
  );

  // Finally delete the user account
  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}