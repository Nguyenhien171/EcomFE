import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

// // Import pages
import Dashboard from '../pages/Dashboard'
// import About from 'pages/About'
// import StaffList from 'pages/StaffList'

// Import path constants
import path from '../constants/path'
import Products from '../pages/Products'

const router = createBrowserRouter([
  {
    // Set chính cho web JSS
    path: '',
    index: true,
    element: (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    )
  },
  {
    path: path.dashboard,
    element: (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    )
  },
  {
    path: '/products',
    element: (
      <MainLayout>
        <Products />
      </MainLayout>
    )
  }
  // {
  //   path: '',
  //   element: <MainLayout>{/* <StaffList /> */}</MainLayout>
  // }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
