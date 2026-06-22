

import { ProductType } from '@/types';

interface ProductsResponse {
  products: ProductType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export async function fetchProducts(
  page = 1,
  limit = 12,
  category = '',
  search?: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`/api/products?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function fetchProductById(id: number): Promise<ProductType> {
  const response = await fetch(`/api/products/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  return response.json();
}