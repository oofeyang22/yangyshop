import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';


export async function PUT(
  req: NextRequest, 
  context: { params: Promise<{ id: string }> } 
) {
  const auth = await requireAdmin();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }


  const { id } = await context.params;

  await connectToDatabase();
  const { status, paymentStatus } = await req.json();

  const order = await Order.findOneAndUpdate(
    { orderId: id }, 
    { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
    { new: true }
  );

  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true, order });
}