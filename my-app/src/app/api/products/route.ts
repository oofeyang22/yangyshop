

//products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SortOrder } from 'mongoose'
import { connectToDatabase } from '@/lib/utils';
import { Product } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const sortMap: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    asc:    { price: 1 },
    desc:   { price: -1 },
    };

const sortQuery: Record<string, SortOrder> = sortMap[sort] ?? { createdAt: -1 };

    let query: any = {};

    if (search) {

      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
       query.category = category;
     }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      //.sort({ id: 1 })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}