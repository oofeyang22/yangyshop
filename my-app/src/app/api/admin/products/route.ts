import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Product } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectToDatabase();
  const body = await req.json();

  const lastProduct = await Product.findOne().sort({ id: -1 });
  const newId = (lastProduct?.id || 0) + 1;

  const product = await Product.create({ ...body, id: newId });
  return NextResponse.json({ success: true, product }, { status: 201 });
}