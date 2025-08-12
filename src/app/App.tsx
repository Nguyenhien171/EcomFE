import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

import Dashboard from '../pages/Dashboard'
import Login from '../pages/login'
import Register from '../pages/register'
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
  },
  // {
  //   path: '',
  //   element: <MainLayout>{/* <StaffList /> */}</MainLayout>
  // }
  {
    path: path.login,
    element: <Login />
  },
  {
    path: path.register,
    element: <Register />
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
