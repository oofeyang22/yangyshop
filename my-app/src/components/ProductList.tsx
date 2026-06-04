
'use client';
import React from 'react';
import { Categories } from './Categories';
import { ProductGrid } from './ProductGrid';
import Link from 'next/link';
import Filter from './Filter';
import { categories } from '@/data/categories';
import { useProducts } from '../app/hooks/useProducts';

interface ProductListProps {
  category: string;
  params: "homepage" | "products";
  showFilter?: boolean;
}

function ProductList({ category, params, showFilter = false }: ProductListProps) {
  const { products, loading, error } = useProducts(1, 12);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

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