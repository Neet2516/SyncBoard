import { useMemo, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Loader from '../components/Loader'
import { RegisterResponse } from '../types/yjsSchema'
import {
  RegisterFormValues,
  getPasswordChecks,
  passwordChecklist,
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
  const passwordChecks = useMemo(() => getPasswordChecks(form.password), [form.password])
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-5xl font-normal text-blue-600 mb-2 tracking-tight font-syncboard">SyncBoard</h1>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${showFieldError('fullName') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('fullName') && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${showFieldError('password') ? 'border-red-300' : 'border-gray-300'}`}
                />
              </div>
              {showFieldError('password') && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              <div className="mt-3 rounded-md bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Password requirements</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li className={passwordChecks.minLength ? 'text-green-600' : ''}>{passwordChecklist[0]}</li>
                  <li className={passwordChecks.uppercase ? 'text-green-600' : ''}>{passwordChecklist[1]}</li>
                  <li className={passwordChecks.lowercase ? 'text-green-600' : ''}>{passwordChecklist[2]}</li>
                  <li className={passwordChecks.number ? 'text-green-600' : ''}>{passwordChecklist[3]}</li>
                  <li className={passwordChecks.special ? 'text-green-600' : ''}>{passwordChecklist[4]}</li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                  onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${showFieldError('confirmPassword') ? 'border-red-300' : 'border-gray-300'}`}
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
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || !isFormValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
