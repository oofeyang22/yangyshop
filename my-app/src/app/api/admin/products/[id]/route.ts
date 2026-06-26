import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Product } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });


  const { id: rawId } = await params;
  const id = parseInt(rawId);
  const body = await req.json();

  await connectToDatabase();
  const product = await Product.findOneAndUpdate({ id }, body, { new: true });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, product });
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } // params is now a Promise
) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });


  const { id: rawId } = await params;
  const id = parseInt(rawId);

  await connectToDatabase();
  const product = await Product.findOneAndDelete({ id });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}