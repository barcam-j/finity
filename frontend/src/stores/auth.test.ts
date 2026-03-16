import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

import { authService } from '@/services/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── isAuthenticated ────────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('is false when there is no token', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('is true when a token is present in localStorage on init', () => {
      localStorage.setItem('token', 'persisted-jwt')
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears the token ref', () => {
      localStorage.setItem('token', 'my-token')
      const store = useAuthStore()
      store.logout()
      expect(store.token).toBeNull()
    })

    it('removes the token from localStorage', () => {
      localStorage.setItem('token', 'my-token')
      const store = useAuthStore()
      store.logout()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('clears the user ref', () => {
      const store = useAuthStore()
      store.user = { id: '1', email: 'test@test.com' }
      store.logout()
      expect(store.user).toBeNull()
    })

    it('isAuthenticated becomes false after logout', () => {
      localStorage.setItem('token', 'my-token')
      const store = useAuthStore()
      store.logout()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('sets the token on success', async () => {
      const store = useAuthStore()
      vi.mocked(authService.login).mockResolvedValue({ access_token: 'jwt-token', token_type: 'bearer' })

      await store.login('user@test.com', 'password')

      expect(store.token).toBe('jwt-token')
    })

    it('persists the token to localStorage on success', async () => {
      const store = useAuthStore()
      vi.mocked(authService.login).mockResolvedValue({ access_token: 'jwt-token', token_type: 'bearer' })

      await store.login('user@test.com', 'password')

      expect(localStorage.getItem('token')).toBe('jwt-token')
    })

    it('sets error and rethrows on failure', async () => {
      const store = useAuthStore()
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

      await expect(store.login('user@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
      expect(store.error).toBe('Invalid credentials')
    })

    it('resets loading to false after success', async () => {
      const store = useAuthStore()
      vi.mocked(authService.login).mockResolvedValue({ access_token: 'token', token_type: 'bearer' })

      await store.login('user@test.com', 'password')

      expect(store.loading).toBe(false)
    })

    it('resets loading to false after failure', async () => {
      const store = useAuthStore()
      vi.mocked(authService.login).mockRejectedValue(new Error('fail'))

      await store.login('a', 'b').catch(() => {})

      expect(store.loading).toBe(false)
    })
  })
})
