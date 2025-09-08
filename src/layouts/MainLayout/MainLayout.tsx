import React from 'react'
import Header from '../../components/Headers'
import SideBar from '../../components/SideBar'

interface Props {
  children?: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className='w-full'>
      <Header />
      <div className='grid min-h-screen grid-cols-[260px_1fr]'>
        <SideBar />
        <main className='col-span-1 min-w-0 h-full py-4 px-6'>
          <div className='max-w-full overflow-x-auto break-words'>{children}</div>
        </main>
      </div>
    </div>
  )
}
