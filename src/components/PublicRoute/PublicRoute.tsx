import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import path from '../../constants/path'

interface PublicRouteProps {
  children: React.ReactNode
  redirectPath?: string
}

export default function PublicRoute({ 
  children, 
  redirectPath = path.dashboard 
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}

