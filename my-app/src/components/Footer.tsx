import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
    <div className='mt-16 flex flex-col md:flex-row items-center md:items-start md:justify-between md:gap-0 bg-gray-800 p-8 rounded-lg '>
        <div className='flex flex-col gap-4 items-center md:items-start'>
        <Link href={'/'} className='flex items-center'>
            <Image src="/logo.png" alt="logo" width={36} height={36} className='w-6 h-6 md:w-9 md:h-9'/>
            <p className='hidden md:block text-md font-medium text-white'>TrendArena</p>
        </Link>
        <p className='text-sm text-gray-400'>2026 yangy</p>
        <p className='text-sm text-gray-400'>All rights reserved</p>
        </div>
        <div className='flex flex-col gap-4 items-center text-gray-500 md:items-start'>
            <p className='text-sm text-amber-50'>Links</p>
            <Link href={'/'}>Homepage</Link>
            <Link href={'/'}>Contact</Link>
            <Link href={'/'}>Terms of Service</Link>
            <Link href={'/'}>Privacy Policy</Link>
        </div>
         <div className='flex flex-col gap-4 items-center text-gray-500 md:items-start'>
            <p className='text-sm text-amber-50'>Links</p>
            <Link href={'/'}>All Products</Link>
            <Link href={'/'}>New Arrivals</Link>
            <Link href={'/'}>Best Sellers</Link>
            <Link href={'/'}>Sale</Link>
        </div>
        <div className='flex flex-col gap-4 items-center text-gray-500 md:items-start'>
            <p className='text-sm text-amber-50'>Links</p>
            <Link href={'/'}>About</Link>
            <Link href={'/'}>Contact</Link>
            <Link href={'/'}>Blog</Link>
            <Link href={'/'}>Affiliate Programs</Link>
        </div>       
    </div>
  )
}

export default Footer