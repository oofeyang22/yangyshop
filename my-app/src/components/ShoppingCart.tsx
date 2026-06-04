"use client"
import Link from 'next/link'
import React from 'react'
import { ShoppingCart } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import { CartItemsType } from '@/types'

const ShoppingCartIcon = () => {
  const { cart } = useCartStore()
  

  const safeCart: CartItemsType = Array.isArray(cart) ? cart : []
  

  const totalQuantity = safeCart.reduce((acc, item) => {
    return acc + (item.quantity || 0)
  }, 0)

  return (
    <Link href={'/cart'} className='relative'>
      <ShoppingCart className='w-4 h-4 text-gray-500'/>
      <span className='absolute -top-3 -right-3 bg-amber-400 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
        {totalQuantity}
      </span>
    </Link>
  )
}

export default ShoppingCartIcon