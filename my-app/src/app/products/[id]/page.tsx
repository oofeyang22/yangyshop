
import ProductInteraction from '@/components/ProductInteraction';
import { getProductById, generateProductStaticParams } from '@/data/products';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export { generateProductStaticParams as generateStaticParams };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(parseInt(id));
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  return {
    title: product.name,
    description: product.description,
  };
}

const ProductPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string; size?: string }>;
}) => {
  const { id } = await params;
  const { size, color } = await searchParams;
  
  const product = getProductById(parseInt(id));
  
  if (!product) {
    notFound();
  }

  const selectedSize = size || (product.sizes[0] as string);
  const selectedColor = color || (product.colors[0] as string);
  
  return (
    <div className='flex flex-col lg:flex-row gap-4 md:gap-12 mt-10'>
      <div className='w-full lg:w-5/12 relative aspect-2/3'>
        <Image 
          src={product.images[selectedColor]} 
          alt={product.name} 
          fill 
          className='object-contain rounded-md'
        />
      </div>
      <div className='w-full lg:w-7/12 flex flex-col gap-4'>
        <h1 className='text-2xl font-medium'>{product.name}</h1>
        <p className='text-gray-500'>{product.description}</p>
        <h2 className='text-2xl font-semibold'>${product.price.toFixed(2)}</h2>
        <ProductInteraction 
          product={product} 
          selectedSize={selectedSize} 
          selectedColor={selectedColor}
        />
        <div className='flex items-center gap-2 mt-4'>
          <Image src="/klarna.png" alt="card" width={50} height={25} className='rounded-md'/>
          <Image src="/cards.png" alt="card" width={50} height={25} className='rounded-md'/>
          <Image src="/stripe.png" alt="card" width={50} height={25} className='rounded-md'/>
        </div>
        <p className='text-xs text-gray-500'>
          By clicking pay now, you agree to our{' '}
          <span className='underline hover:text-black'>Privacy Policy</span>. You authorize us to charge your selected payment method
          for total amount shown. All sales are subject to our return and{' '}
          <span className='underline hover:text-black'>Refund Policies.</span>
        </p>
      </div>  
    </div>
  );
};

export default ProductPage;