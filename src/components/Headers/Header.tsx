import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { FaSearch, FaRegCommentDots, FaUserCircle, FaSignOutAlt, FaCoins } from 'react-icons/fa'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { BiLogoMagento } from 'react-icons/bi'
import { FiFlag } from 'react-icons/fi'
import { HiMenuAlt3 } from 'react-icons/hi'
import { IoSunnyOutline } from 'react-icons/io5'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import path from '../../constants/path'
import GoldPricePopup from '../GoldPricePopup/GoldPricePopup'

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(path.login)
  }

  const handleGoldPriceClick = () => {
    const width = window.screen.width
    const height = window.screen.height
    const popupWindow = window.open(
      '',
      'goldPriceWindow',
      `width=${width},height=${height},left=0,top=0`
    )

    if (popupWindow) {
      // Set up the basic HTML structure
      popupWindow.document.body.innerHTML = '<div id="root"></div>'
      popupWindow.document.body.className = 'bg-gray-100 p-4 grid place-items-center'
      popupWindow.document.title = 'Giá vàng SJC'

      // Add Tailwind CSS
      const tailwindScript = popupWindow.document.createElement('script')
      tailwindScript.src = 'https://cdn.tailwindcss.com'
      popupWindow.document.head.appendChild(tailwindScript)

      // Render the React component into the popup
      const root = ReactDOM.createRoot(popupWindow.document.getElementById('root')!)
      root.render(
        <React.StrictMode>
          <GoldPricePopup />
        </React.StrictMode>
      )
    }
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

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
        <button
          onClick={handleGoldPriceClick}
          className='flex items-center gap-2 rounded-xl bg-yellow-400 px-3 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-500'
        >
          <FaCoins />
          Giá vàng
        </button>

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
        <div className='relative user-menu-container'>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className='flex items-center gap-2 text-gray-700 hover:text-gray-900'
          >
            <FaUserCircle className='text-3xl text-gray-500' />
            <span className='absolute bottom-0 right-0 block w-2 h-2 bg-green-500 rounded-full border-2 border-white'></span>
          </button>

          {showUserMenu && (
            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border'>
              <div className='px-4 py-2 text-sm text-gray-700 border-b'>
                <div className='font-medium'>{user?.full_name || user?.username}</div>
                <div className='text-gray-500'>{user?.email}</div>
                <div className='text-xs text-blue-600 mt-1'>{user?.role}</div>
              </div>
              <button
                onClick={() => navigate(path.profile)}
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2'
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
