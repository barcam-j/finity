import { useAuthStore } from '@/stores/auth'
import type { UserPreferences } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token ?? ''}`, 'Content-Type': 'application/json' }
}

export const preferencesService = {
  async get(): Promise<UserPreferences> {
    const res = await fetch(`${BASE_URL}/preferences/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to load preferences')
    return res.json() as Promise<UserPreferences>
  },

  async save(data: UserPreferences): Promise<UserPreferences> {
    const res = await fetch(`${BASE_URL}/preferences/`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to save preferences')
    return res.json() as Promise<UserPreferences>
  },
}
