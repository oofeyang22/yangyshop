

import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductInteraction from '@/components/ProductInteraction';
import { Product } from '@/lib/models';

export default async function ProductPage({
  params, searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string; size?: string }>;
}) {
  const { id } = await params;
  const { size, color } = await searchParams;

  const product = await Product.findOne({ id: parseInt(id) }).lean();

  if (!product) notFound();

  // Serialize the Mongoose document into a plain object
  const serializedProduct = {
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
   images: product.images as Record<string, string>,
  };

  const selectedSize = size || (serializedProduct.sizes[0] as string);
  const selectedColor = color || (serializedProduct.colors[0] as string);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={serializedProduct.images[serializedProduct.colors[0]]}
            alt={serializedProduct.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{serializedProduct.name}</h1>
          <p className="text-gray-600">{serializedProduct.description}</p>
          <p className="text-2xl font-bold">${serializedProduct.price.toFixed(2)}</p>
          <ProductInteraction
            product={serializedProduct}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
}