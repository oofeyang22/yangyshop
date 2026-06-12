import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';
export async function PUT(req: NextRequest, { params }: { params: { orderId: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectToDatabase();
  const { status, paymentStatus } = await req.json();

  const order = await Order.findOneAndUpdate(
    { orderId: params.orderId },
    { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
    { new: true }
  );

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, order });
}