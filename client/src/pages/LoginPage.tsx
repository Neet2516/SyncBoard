import { useMemo, useState } from 'react'
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import { LoginResponse } from '../types/yjsSchema'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { LoginFormValues, validateLoginForm } from '../utils/authValidation'

/**
 * LoginPage Component
 *
 * Provides a user interface for authenticating existing users.
 * Handles form validation and session initialization.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' })
  const [touched, setTouched] = useState<Record<keyof LoginFormValues, boolean>>({
    email: false,
    password: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const locationState = location.state as { returnTo?: string; message?: string } | null
  const returnTo = locationState?.returnTo
  const infoMessage = locationState?.message
  const errors = useMemo(() => validateLoginForm(form), [form])
  const isFormValid = Object.keys(errors).length === 0

  // Show loader while checking authentication status
  if (isLoading) {
    return <Loader />
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={returnTo || '/boards'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (!isFormValid) {
      setError('Please fix the highlighted fields before continuing.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.post<LoginResponse>('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })

      login({
        id: data.user.userId,
        name: data.user.name,
        email: data.user.email,
      })

      navigate(returnTo || '/boards', { replace: true })
    } catch (err) {
      console.error('[Login] Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showFieldError = (field: keyof LoginFormValues) => touched[field] && errors[field]

  return (
    <div className="flex min-h-screen flex-col justify-center bg-transparent py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="brand-kicker text-center">Welcome back</p>
        <h1 className="brand-mark mb-2 text-center text-5xl text-blue-600">SyncBoard</h1>
        <h2 className="section-title mt-6 text-center text-3xl text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="paper-card rounded-[2rem] bg-white/90 px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {infoMessage && (
              <div className="rounded bg-blue-50 p-2 text-sm font-medium text-blue-700">
                {infoMessage}
              </div>
            )}
            <div>
              <label htmlFor="email" className="stat-label block text-sm font-semibold text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${showFieldError('email') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('email') && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="stat-label block text-sm font-semibold text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${showFieldError('password') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('password') && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`flex w-full justify-center rounded-full border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold tracking-wide text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 ${(loading || !isFormValid) ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/90 px-2 text-gray-500">New to <span className="brand-mark inline-block text-sm text-blue-600">SyncBoard</span>?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="flex w-full justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold tracking-wide text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
