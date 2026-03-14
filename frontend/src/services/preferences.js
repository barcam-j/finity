import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }
}

export const preferencesService = {
  async get() {
    const res = await fetch(`${BASE_URL}/preferences/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to load preferences')
    return res.json()
  },

  async save(data) {
    const res = await fetch(`${BASE_URL}/preferences/`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to save preferences')
    return res.json()
  },
}
