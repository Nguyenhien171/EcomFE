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
      <div className='grid min-h-screen grid-cols-4'>
        <SideBar />
        <main className='col-span-3 h-full py-4 px-3'>{children}</main>
      </div>
    </div>
  )
}
