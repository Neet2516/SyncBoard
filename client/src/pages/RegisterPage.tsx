import { useMemo, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Loader from '../components/Loader'
import { RegisterResponse } from '../types/yjsSchema'
import {
  RegisterFormValues,
  validateRegisterForm,
} from '../utils/authValidation'

/**
 * RegisterPage Component
 * 
 * Handles new user registration.
 */
export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [form, setForm] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState<Record<keyof RegisterFormValues, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errors = useMemo(() => validateRegisterForm(form), [form])
  const isFormValid = Object.keys(errors).length === 0

  // Show loader while checking authentication status
  if (isLoading) {
    return <Loader />
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/boards" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (!isFormValid) {
      setError('Please fix the highlighted fields before creating your account.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post<RegisterResponse>('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })

      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      console.error('[Register] Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const showFieldError = (field: keyof RegisterFormValues) => touched[field] && errors[field]

  return (
    <div className="flex min-h-screen flex-col justify-center bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="brand-kicker text-center">Join the canvas</p>
        <h1 className="brand-mark mb-2 text-center text-5xl text-blue-600">SyncBoard</h1>
        <h2 className="section-title mt-6 text-center text-3xl text-gray-900">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="paper-card rounded-[2rem] bg-white/90 px-5 py-8 sm:px-8 md:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="stat-label block text-sm font-semibold text-gray-700">Full Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
                  className={`block min-h-12 w-full appearance-none rounded-md border px-4 py-3 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${showFieldError('fullName') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('fullName') && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
            </div>

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
                  className={`block min-h-12 w-full appearance-none rounded-md border px-4 py-3 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${showFieldError('email') ? 'border-red-300' : 'border-gray-300'}`}
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
                  required
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  className={`block min-h-12 w-full appearance-none rounded-md border px-4 py-3 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${showFieldError('password') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('password') && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="stat-label block text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                  className={`block min-h-12 w-full appearance-none rounded-md border px-4 py-3 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${showFieldError('confirmPassword') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('confirmPassword') && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
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
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/90 px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold tracking-wide text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-50"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
