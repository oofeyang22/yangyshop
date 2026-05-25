// components/ProductGrid.tsx

import { ProductType } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ProductType[];
  className?: string;
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 ${className}`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}