import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import { SessionUserResponse } from '../types/yjsSchema'

interface User {
  id: string
  email?: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await api.get<SessionUserResponse>('/auth/me')
        const restoredUser: User = {
          id: session.user.userId,
          name: session.user.name,
          email: session.user.email,
        }

        localStorage.setItem('user', JSON.stringify(restoredUser))
        localStorage.setItem('name', restoredUser.name)
        localStorage.setItem('userId', restoredUser.id)
        setUser(restoredUser)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('name')
        localStorage.removeItem('userId')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('name', newUser.name)
    localStorage.setItem('userId', newUser.id)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('name')
    localStorage.removeItem('userId')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
