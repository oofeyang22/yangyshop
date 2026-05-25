
import React from 'react';
import { Categories } from './Categories';
import { ProductGrid } from './ProductGrid';
import Link from 'next/link';
import Filter from './Filter';
import { categories } from '@/data/categories';
import { products } from '@/data/products';

interface ProductListProps {
  category: string;
  params: "homepage" | "products";
  showFilter?: boolean;
}

function ProductList({ category, params, showFilter = false }: ProductListProps) {
  return (
    <div className='w-full'>
      <Categories categories={categories} />
      <Filter />
      <ProductGrid products={products} />
      <Link 
        href={category ? `/products/?category=${category}` : "/products"} 
        className='flex justify-end mt-4 underline text-sm text-gray-500'
      >
        View all Products
      </Link>
    </div>
  );
}

export default ProductList;