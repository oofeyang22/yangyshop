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

export default Searchbar