import React from 'react'
import { Link } from 'react-router-dom'
import path from '../../constants/path'

export default function SideBar() {
  return (
    <aside className='col-span-1' aria-label='Sidebar'>
      <div className='h-full overflow-y-auto bg-gray-100 py-4 px-3 shadow-lg'>
        <ul className='space-y-2'>
          <li>
            <Link
              to={path.dashboard}
              className='flex items-center rounded-lg bg-gray-300 p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3 font-bold'>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.products}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Products</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.orders}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.statistics}
              className='flex i
              tems-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Statistics</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.reviews}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Reviews</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.customers}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Customers</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.transactions}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Transactions</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.settings}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Settings</span>
            </Link>
          </li>
          <li>
            <Link
              to={path.profile}
              className='flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-300'
            >
              <span className='ml-3'>Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
}
