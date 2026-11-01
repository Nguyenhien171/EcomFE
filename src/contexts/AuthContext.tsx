import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { decodeToken } from '../utils/axios.http'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: UserRole
  status: 'active' | 'inactive'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
  hasPermission: (requiredRole: UserRole) => boolean
  canCreateUser: (targetRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const USER_KEY = 'user_data'

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data from localStorage on mount
  useEffect(() => {
    const init = () => {
      try {
        const rawUser = localStorage.getItem(USER_KEY)
        const token = localStorage.getItem('accessToken')

        if (rawUser) {
          const parsed = JSON.parse(rawUser) as User
          setUser(parsed)
          setIsLoading(false)
          return
        }

        if (token) {
          const decoded = decodeToken(token)
          if (!decoded) {
            setIsLoading(false)
            return
          }

          // token expired
          if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem(USER_KEY)
            setUser(null)
            setIsLoading(false)
            return
          }

          const userData: User = {
            id: decoded.sub,
            email: decoded.email,
            username: decoded.username,
            full_name: decoded.full_name,
            role: decoded.role,
            status: decoded.status ?? 'active'
          }

          localStorage.setItem(USER_KEY, JSON.stringify(userData))
          setUser(userData)
        }
      } catch (err) {
        console.error('Auth init error', err)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  // Listen for logout events from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  const login = (accessToken: string, refreshToken: string) => {
    const decoded = decodeToken(accessToken)
    if (!decoded) return

    if (decoded.exp && Math.floor(Date.now() / 1000) >= decoded.exp) {
      console.warn('Attempt to login with expired token')
      return
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    const userData: User = {
      id: decoded.sub ?? decoded.id ?? '',
      email: decoded.email ?? '',
      username: decoded.username ?? '',
      full_name: decoded.full_name ?? '',
      role: decoded.role,
      status: decoded.status ?? 'active'
    }

    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false

    const roleHierarchy: Record<UserRole, number> = {
      STAFF: 1,
      MANAGER: 2,
      ADMIN: 3
    }

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
  }

  const canCreateUser = (targetRole: UserRole): boolean => {
    if (!user) return false
    if (user.role === 'ADMIN') return targetRole === 'MANAGER' || targetRole === 'STAFF'
    if (user.role === 'MANAGER') return targetRole === 'STAFF'
    return false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    canCreateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
