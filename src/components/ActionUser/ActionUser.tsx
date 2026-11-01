import React, { useState } from 'react'
import { CiMenuKebab } from 'react-icons/ci'
import { FaEye } from 'react-icons/fa'
import { FiEdit3 } from 'react-icons/fi'
import { FaLinkSlash } from 'react-icons/fa6'

export default function ActionUser() {
  const [open, setOpen] = useState(false)

  return (
    <div className='relative text-left flex justify-center items-center'>
      <button onClick={() => setOpen(!open)} className='p-2 rounded hover:bg-gray-100'>
        <CiMenuKebab />
      </button>
      {open && (
        <div className='absolute right-12 w-30 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-999 '>
          <div className='py-1 flex'>
            <button onClick={() => alert('View')} className='px-2 py-2 text-sm text-gray-700 hover:bg-gray-100'>
              <FaEye />
            </button>
            <button onClick={() => alert('Edit')} className='px-2 py-2 text-sm text-gray-700 hover:bg-gray-100'>
              <FiEdit3 />
            </button>
            <button onClick={() => alert('Deactivate')} className='px-2 py-2 text-sm text-red-600 hover:bg-gray-100'>
              <FaLinkSlash />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
