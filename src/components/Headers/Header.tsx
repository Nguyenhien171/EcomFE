import React from 'react'
import { FaSearch, FaRegCommentDots, FaUserCircle } from 'react-icons/fa'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { BiLogoMagento } from 'react-icons/bi'
import { FiFlag } from 'react-icons/fi'
import { HiMenuAlt3 } from 'react-icons/hi'
import { IoSunnyOutline } from 'react-icons/io5'
export default function Header() {
  return (
    <header className='flex items-center justify-between bg-white px-4 py-2 shadow'>
      {/* Left: Logo + Menu */}
      <div className='flex items-center gap-3'>
        <BiLogoMagento className='text-xl cursor-pointer text-blue-700' />
        <span className='text-lg font-bold text-blue-950 font-serif'>Starpath</span>
        <HiMenuAlt3 />
      </div>

      {/* Middle: Search box */}
      <div className='flex flex-1 justify-center'>
        <div className='flex items-center border rounded px-3 py-1 w-96'>
          <input type='text' placeholder='Search' className='flex-1 outline-none' />
          <FaSearch className='text-gray-500' />
        </div>
      </div>

      {/* Right: Icons */}
      <div className='flex items-center gap-4'>
        <IoSunnyOutline className='cursor-pointer text-xl' />
        <FiFlag className='text-xl cursor-pointer' />
        {/* Thay flag Mỹ bằng icon flag sử dụng 1 hash code để gán ảnh cờ vào */}
        <div className='relative cursor-pointer'>
          <FaRegCommentDots className='text-xl' />
          <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full px-1'>7</span>
        </div>
        <div className='relative cursor-pointer'>
          <IoMdNotificationsOutline className='text-xl' />
          <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1'>5</span>
        </div>
        <div className='relative'>
          <FaUserCircle className='text-3xl text-gray-500' /> {/* Thay avatar bằng icon user */}
          <span className='absolute bottom-0 right-0 block w-2 h-2 bg-green-500 rounded-full border-2 border-white'></span>
        </div>
      </div>
    </header>
  )
}
