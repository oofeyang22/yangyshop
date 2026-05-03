

import ProductInteraction from '@/components/ProductInteraction';
import { ProductType } from '@/types';
import Image from 'next/image';
import { notFound } from 'next/navigation';


const products: ProductType[] = [
  {
    id: 1,
    name: "Adidas CoreFit T-Shirt",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 39.9,
    sizes: ["s", "m", "l", "xl", "xxl"],
    colors: ["gray", "purple", "green"],
    images: {
      gray: "/products/1g.png",
      purple: "/products/1p.png",
      green: "/products/1gr.png",
    },
  },
  {
    id: 2,
    name: "Puma Ultra Warm Zip",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 59.9,
    sizes: ["s", "m", "l", "xl"],
    colors: ["gray", "green"],
    images: { gray: "/products/2g.png", green: "/products/2gr.png" },
  },
  {
    id: 3,
    name: "Nike Air Essentials Pullover",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 69.9,
    sizes: ["s", "m", "l"],
    colors: ["green", "blue", "black"],
    images: {
      green: "/products/3gr.png",
      blue: "/products/3b.png",
      black: "/products/3bl.png",
    },
  },
  {
    id: 4,
    name: "Nike Dri Flex T-Shirt",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 29.9,
    sizes: ["s", "m", "l"],
    colors: ["white", "pink"],
    images: { white: "/products/4w.png", pink: "/products/4p.png" },
  },
  {
    id: 5,
    name: "Under Armour StormFleece",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 49.9,
    sizes: ["s", "m", "l"],
    colors: ["red", "orange", "black"],
    images: {
      red: "/products/5r.png",
      orange: "/products/5o.png",
      black: "/products/5bl.png",
    },
  },
  {
    id: 6,
    name: "Nike Air Max 270",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 59.9,
    sizes: ["40", "42", "43", "44"],
    colors: ["gray", "white"],
    images: { gray: "/products/6g.png", white: "/products/6w.png" },
  },
  {
    id: 7,
    name: "Nike Ultraboost Pulse",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 69.9,
    sizes: ["40", "42", "43"],
    colors: ["gray", "pink"],
    images: { gray: "/products/7g.png", pink: "/products/7p.png" },
  },
  {
    id: 8,
    name: "Levi's Classic Denim",
    shortDescription: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    description: "Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit. Lorem ipsum dolor sit amet consect adipisicing elit lorem ipsum dolor sit.",
    price: 59.9,
    sizes: ["s", "m", "l"],
    colors: ["blue", "green"],
    images: { blue: "/products/8b.png", green: "/products/8gr.png" },
  },
];


function getProductById(id: number) {
  return products.find(product => product.id === id);
}


export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}


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