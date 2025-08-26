import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { AuthProvider } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'

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
import Users from '../pages/Users'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'

const router = createBrowserRouter([
  {
    // Default to Login when entering site
    path: '',
    index: true,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: path.dashboard,
    element: (
      <ProtectedRoute requiredRole="MANAGER">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Products />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Orders />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/statistics',
    element: (
      <ProtectedRoute requiredRole="MANAGER">
        <MainLayout>
          <Statistics />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/reviews',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Reviews />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/customers',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Customer />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Transaction />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredRole="MANAGER">
        <MainLayout>
          <Users />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <MainLayout>
          <Settings />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Profile />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: path.test,
    element: <Test />
  },
  {
    path: path.login,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: path.register,
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    )
  },
  {
    path: '*',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  }
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
