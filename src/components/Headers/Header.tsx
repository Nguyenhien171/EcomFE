import React from 'react'
import { FaSearch, FaRegCommentDots, FaUserCircle } from 'react-icons/fa'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { BiLogoMagento } from 'react-icons/bi'
import { FiFlag } from 'react-icons/fi'
import { HiMenuAlt3 } from 'react-icons/hi'
import { IoSunnyOutline } from 'react-icons/io5'

export default function Header() {
  return (
    <header className='flex items-center justify-between bg-white px-4 py-4 shadow'>
      {/* Left: Logo + Menu */}
      <div className='flex items-center min-w-[70px] max-w-[230px]  w-full justify-between'>
        <div className='flex items-center gap-3'>
          <BiLogoMagento className='text-3xl cursor-pointer text-blue-700' />
          <span className='text-2xl font-bold text-blue-950 font-serif'>Starpath</span>
        </div>
        <HiMenuAlt3 className='text-xl cursor-pointer text-gray-500' />
      </div>

      {/* Middle: Search box */}
      <div className='flex flex-1 justify-start ml-10'>
        <div className='flex items-center border-2 rounded px-3 py-2 w-[500px]'>
          <input type='text' placeholder='Search' className='flex-1 outline-none' />
          <FaSearch className='text-gray-500' />
        </div>
      </div>

      {/* Right: Icons */}
      <div className='flex items-center gap-8'>
        <IoSunnyOutline className='cursor-pointer text-3xl' />
        <FiFlag className='text-2xl cursor-pointer' />
        {/* Thay flag Mỹ bằng icon flag sử dụng 1 hash code để gán ảnh cờ vào */}
        <div className='relative cursor-pointer'>
          <FaRegCommentDots className='text-2xl' />
          <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1'>7</span>
        </div>
        <div className='relative cursor-pointer'>
          <IoMdNotificationsOutline className='text-2xl' />
          <span className='absolute -top-1 -right-0 bg-red-500 text-white text-xs rounded-full px-1'>5</span>
        </div>
        <div className='relative'>
          <FaUserCircle className='text-3xl text-gray-500' /> {/* Thay avatar bằng icon user */}
          <span className='absolute bottom-0 right-0 block w-2 h-2 bg-green-500 rounded-full border-2 border-white'></span>
        </div>
      </div>
    </header>
  )
}
