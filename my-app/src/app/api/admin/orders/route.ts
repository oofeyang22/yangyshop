import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Order } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectToDatabase();
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status');

  const query: any = {};
  if (status) query.status = status;

  const orders = await Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await Order.countDocuments(query);

  return NextResponse.json({ orders, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total } });
}