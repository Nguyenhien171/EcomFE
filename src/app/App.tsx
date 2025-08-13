import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

import Dashboard from '../pages/Dashboard'
import Login from '../pages/login'
import Test from '../pages/Test/Text'
import Register from '../pages/register'
import path from '../constants/path'
import Products from '../pages/Products'
import Orders from '../pages/Orders'
import Statistics from '../pages/Statistics'
import Reviews from '../pages/Reviews'
import Customer from '../pages/Customers'
import Transaction from '../pages/Transactions'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'

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
  {
    path: '/orders',
    element: (
      <MainLayout>
        <Orders />
      </MainLayout>
    )
  },
  {
    path: '/statistics',
    element: (
      <MainLayout>
        <Statistics />
      </MainLayout>
    )
  },
  {
    path: '/reviews',
    element: (
      <MainLayout>
        <Reviews />
      </MainLayout>
    )
  },
  {
    path: '/customers',
    element: (
      <MainLayout>
        <Customer />
      </MainLayout>
    )
  },
  {
    path: '/transactions',
    element: (
      <MainLayout>
        <Transaction />
      </MainLayout>
    )
  },
  {
    path: '/settings',
    element: (
      <MainLayout>
        <Settings />
      </MainLayout>
    )
  },
  {
    path: '/profile',
    element: (
      <MainLayout>
        <Profile />
      </MainLayout>
    )
  },
  {
    path: path.test,
    element: <Test />
  },
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
