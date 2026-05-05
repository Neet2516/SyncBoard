import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AuthGuard Component
 * 
 * Protects routes from unauthenticated access.
 */
export function AuthGuard() {
  const { isAuthenticated, logout, token } = useAuth()

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  try {
    // Basic JWT decoding for expiry check
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))
    
    const isExpired = payload.exp * 1000 < Date.now()

    if (isExpired) {
      console.warn('[AuthGuard] Token expired')
      logout()
      return <Navigate to="/login" replace />
    }

    return <Outlet />
  } catch (error) {
    console.error('[AuthGuard] Invalid token format')
    logout()
    return <Navigate to="/login" replace />
  }
}

