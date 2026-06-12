import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { User } from '@/lib/models';
import { requireAdmin } from '@/lib/adminAuth';
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectToDatabase();
  const users = await User.find().select('-password');
  return NextResponse.json({ users });
}