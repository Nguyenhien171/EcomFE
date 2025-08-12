import React from 'react'
import Header from '../../components/Headers'
import SideBar from '../../components/SideBar'

interface Props {
  children?: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className=''>
      <Header />
      <div className='grid min-h-screen grid-cols-[260px_1fr]'>
        <SideBar />
        <main className='col-span-1 h-full py-4 px-6'>{children}</main>
      </div>
    </div>
  )
}
