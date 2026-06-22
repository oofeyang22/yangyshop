
'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Searchbar from './searchbar';
import { Bell, Home, User, LogOut } from 'lucide-react';
import ShoppingCartIcon from './ShoppingCart';

function Navbar() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <nav className='w-full flex items-center justify-between border-b border-gray-200 pb-4'>
      <Link href={'/'} className='flex items-center'>
        <Image src="/yangy.png" alt="logo" width={36} height={36} className='w-6 h-6 md:w-9 md:h-9 mr-1'/>
        <p className='hidden md:block text-md font-medium'>Yangymmerce</p>
      </Link>
      <div className='flex items-center gap-6'>
        <Searchbar/>
        <Link href={"/"}>
          <Home className='w-4 h-4 text-gray-500'/>
        </Link>

        <ShoppingCartIcon/>
        
        {status === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : session ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2"
            >
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {session.user?.name?.[0] || session.user?.email?.[0]}
                </div>
              )}
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;