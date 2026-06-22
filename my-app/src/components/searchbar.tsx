/*
import { Search } from 'lucide-react'
import React from 'react'

function Searchbar() {
  return (
    <div className='hidden md:flex items-center gap-2 rounded-md  ring-1 ring-gray-300 px=2 py-1'> 
        <Search className='w-4 h-4 text-gray-500'/>
        <input id="search" placeholder="search..." className='text-sm outline-0'/>
    </div>
  )
}

export default Searchbar*/

'use client';

import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ProductResult {
  id: number;
  name: string;
  price: number;
  images: Record<string, string>;
  colors: string[];
  shortDescription?: string;
}

function Searchbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.products || []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchResults(value);
    }, 350);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(`/products/${results[activeIndex].id}`);
        setIsOpen(false);
        setQuery('');
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const firstImageUrl = (product: ProductResult) => {
    const firstColor = product.colors?.[0];
    return firstColor ? product.images?.[firstColor] : Object.values(product.images || {})[0];
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* Input */}
      <div className="flex items-center gap-2 rounded-md ring-1 ring-gray-300 px-2 py-1 focus-within:ring-2 focus-within:ring-gray-400 transition-all bg-white">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          id="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search products..."
          className="text-sm outline-none w-48 bg-transparent placeholder:text-gray-400"
          autoComplete="off"
        />
        {query && (
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                        activeIndex === index ? 'bg-gray-50' : ''
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-10 h-12 rounded-md overflow-hidden shrink-0 bg-gray-100">
                        {firstImageUrl(product) && (
                          <Image
                            src={firstImageUrl(product)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        {product.shortDescription && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{product.shortDescription}</p>
                        )}
                      </div>
                      {/* Price */}
                      <span className="text-sm font-semibold text-gray-800 shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* View all */}
              <div className="border-t border-gray-100 px-3 py-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => { setIsOpen(false); setQuery(''); }}
                  className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  View all results for <span className="font-medium">"{query}"</span> →
                </Link>
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500">No products found for</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">"{query}"</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Searchbar;