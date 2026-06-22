import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils';
import { Product } from '@/lib/models';
import { products as staticProducts } from '@/data/products';

export async function POST() {
  try {
    await connectToDatabase();

    await Product.deleteMany({});

    const productsToInsert = staticProducts.map(product => ({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      images: new Map(Object.entries(product.images)),
    }));

    const result = await Product.insertMany(productsToInsert);

    return NextResponse.json({
      message: 'Database seeded successfully',
      count: result.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}