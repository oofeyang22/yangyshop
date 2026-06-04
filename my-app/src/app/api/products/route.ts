import { NextRequest, NextResponse } from 'next/server';
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

    let query: any = {};

  
    if (search) {
      query.$text = { $search: search };
    }



    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ id: 1 })
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