import React, { useState } from 'react'

export default function ActionMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className='relative inline-block text-left'>
      <button onClick={() => setOpen(!open)} className='p-2 rounded hover:bg-gray-100'>
        ⋮
      </button>
      {open && (
        <div className='absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50'>
          <div className='py-1'>
            <button
              onClick={() => alert('View')}
              className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
            >
              View
            </button>
            <button
              onClick={() => alert('Edit')}
              className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
            >
              Edit
            </button>
            <button
              onClick={() => alert('Delete')}
              className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
