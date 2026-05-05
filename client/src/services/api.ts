import { API_BASE_URL } from '../constants'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

/**
 * Core fetch wrapper
 *
 * SECURITY FIX: No longer reads token from localStorage.
 * Auth is handled by the HttpOnly cookie, which the browser automatically
 * sends with every same-origin (or CORS-credentialed) request.
 * Setting credentials: 'include' is the only change needed on the client side.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  const url = new URL(`${API_BASE_URL}${endpoint}`)
  if (params) {
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
  }

  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(url.toString(), {
      ...init,
      headers,
      credentials: 'include', // Sends HttpOnly cookie automatically
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to reach the API at ${API_BASE_URL}. Make sure the server is running.`
      )
    }
    throw error
  }

  if (response.status === 401) {
    // Token expired or invalid — redirect to login
    window.location.href = '/login'
    throw new Error('Session expired. Redirecting to login.')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { message?: string; error?: string }
    throw new Error(errorData.message ?? errorData.error ?? 'Something went wrong')
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}
