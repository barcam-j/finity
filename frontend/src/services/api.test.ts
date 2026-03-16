import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/errors'

vi.mock('@/services/auth')
vi.mock('@/i18n', () => ({ setLocale: vi.fn() }))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

import { api } from './api'
import router from '@/router'

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(body),
  })
}

describe('api', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── success ────────────────────────────────────────────────────────────────

  it('returns parsed JSON on a successful response', async () => {
    vi.stubGlobal('fetch', mockFetch({ id: 1, name: 'Test' }))

    const result = await api.get('/test')

    expect(result).toEqual({ id: 1, name: 'Test' })
  })

  // ── authorization header ───────────────────────────────────────────────────

  it('includes Authorization header when token is set', async () => {
    localStorage.setItem('token', 'my-jwt')
    vi.stubGlobal('fetch', mockFetch({}))

    await api.get('/test')

    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer my-jwt',
    })
  })

  it('does not include Authorization header when no token', async () => {
    vi.stubGlobal('fetch', mockFetch({}))

    await api.get('/test')

    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options as RequestInit).headers).not.toHaveProperty('Authorization')
  })

  // ── error handling ─────────────────────────────────────────────────────────

  it('throws ApiError with correct message and status on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch({ detail: 'Not found' }, 404))

    await expect(api.get('/missing')).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
    })
  })

  it('throws an ApiError instance', async () => {
    vi.stubGlobal('fetch', mockFetch({ detail: 'Server error' }, 500))

    await expect(api.get('/error')).rejects.toBeInstanceOf(ApiError)
  })

  // ── 401 handling ───────────────────────────────────────────────────────────

  it('calls logout on 401', async () => {
    localStorage.setItem('token', 'expired-jwt')
    vi.stubGlobal('fetch', mockFetch({ detail: 'Unauthorized' }, 401))

    const store = useAuthStore()
    const logoutSpy = vi.spyOn(store, 'logout')

    await api.get('/protected').catch(() => {})

    expect(logoutSpy).toHaveBeenCalled()
  })

  it('redirects to Login on 401', async () => {
    vi.stubGlobal('fetch', mockFetch({ detail: 'Unauthorized' }, 401))

    await api.get('/protected').catch(() => {})

    expect(router.push).toHaveBeenCalledWith({ name: 'Login' })
  })

  it('does not call logout on non-401 errors', async () => {
    localStorage.setItem('token', 'valid-jwt')
    vi.stubGlobal('fetch', mockFetch({ detail: 'Server error' }, 500))

    const store = useAuthStore()
    const logoutSpy = vi.spyOn(store, 'logout')

    await api.get('/error').catch(() => {})

    expect(logoutSpy).not.toHaveBeenCalled()
  })
})
