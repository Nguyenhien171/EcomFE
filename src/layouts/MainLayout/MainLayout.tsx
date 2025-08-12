import React from 'react'
import { Link } from 'react-router-dom'
import path from '../../constants/path'
import Header from '../../components/Headers'

interface Props {
  children?: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className=''>
      <Header />
      <div className='grid min-h-screen grid-cols-4'>
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
            </ul>
          </div>
        </aside>
        <main className='col-span-3 h-full py-4 px-3'>{children}</main>
      </div>
    </div>
  )
}
