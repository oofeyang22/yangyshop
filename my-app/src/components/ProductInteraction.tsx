"use client"
import useCartStore from '@/stores/cartStore';
import { ProductType } from '@/types'
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const ProductInteraction = ({product, selectedSize, selectedColor}: {product:ProductType;selectedSize:string;selectedColor:string}) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [quantity, setQuantity] = useState(1)
    const {addToCart} = useCartStore()


    const handleTypeChange = (type:string, value:string) =>{
        const params = new URLSearchParams(searchParams.toString())
        params.set(type, value)
        router.push(`${pathname}?${params.toString()}`, {scroll:false })
    }

    const handleQuantityType = (type: "increment" | "decrement") => {
        if (type=== "increment"){
            setQuantity(prev => prev + 1 )
        }else{
            if(quantity>1){
              setQuantity(prev => prev - 1 )
            }
        }
    }

    const handleAddToCart = () => {
        addToCart({
            ...product, quantity, selectedColor, selectedSize
        })
        toast.success("Product added to cart")
    }
  return (
    <div className='flex flex-col gap-4 mt-4'>
        <div className='flex flex-col gap-4 text-xs'>
            <span className='text-gray-500'>Size</span>
            <div className='flex items-center gap-2'>
            {product.sizes.map((size) => (
                <div key={size} onClick={() =>handleTypeChange("size", size)} className={`cursor-pointer border p-0.5 ${selectedSize === size ? 'border-gray-600': 'border-gray-300'}`}>
                    <div className={`w-6 h-6 text-center flex items-center justify-center ${selectedSize === size ? 'bg-black text-white': 'bg-white text-black'}`}>{size.toUpperCase()}</div>
                </div>
            ))}

            </div>

        </div>
        <div className='flex flex-col gap-4 text-sm'>

            <span className='text-gray-500'>Color</span>
            <div className='flex items-center gap-2'>
            {product.colors.map((color) => (
                <div key={color} onClick={() =>handleTypeChange("color", color)} className={`cursor-pointer border p-0.5 ${selectedColor === color ? 'border-gray-600': 'border-white'}`}>
                    <div className={`w-6 h-6 `} style={{backgroundColor: color}}/>
                </div>
            ))}

            </div>
        </div>
        <div className='flex flex-col gap-4 text-sm'>
            <span className='text-gray-500'>Quantity</span>
            <div className='flex items-center gap-2'>
                <button className='cursor-pointer border border-gray-200 p-1' onClick={() => handleQuantityType("decrement")}><Minus className='w-4 h-4'/></button>
                <span>{quantity}</span>
                <button className='cursor-pointer border border-gray-200 p-1' onClick={() => handleQuantityType("increment")}><Plus className='w-4 h-4'/></button>            
            </div>
        </div>
        <button onClick={handleAddToCart} className='bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm font-medium'>
            <Plus className='w-4 h-4'/>
            Add To Cart
        </button>
        <button className='ring-1 ring-gray-500  shaoow-lg  text-gray-800 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium'>
            <ShoppingCart className='w-4 h-4'/>
            Buy Item
        </button>  

    </div>
  )
}

export default ProductInteraction