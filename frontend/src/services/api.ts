import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/errors'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request<T = unknown>(
  method: string,
  path: string,
  body: unknown = null,
): Promise<T> {
  const auth = useAuthStore()

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`
  }

  const options: RequestInit = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    if (res.status === 401) {
      auth.logout()
      const { default: router } = await import('@/router')
      router.push({ name: 'Login' })
    }
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(error.detail || 'Request failed', res.status)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T = unknown>(path: string) => request<T>('GET', path),
  post: <T = unknown>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T = unknown>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T = unknown>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T = unknown>(path: string) => request<T>('DELETE', path),
}
