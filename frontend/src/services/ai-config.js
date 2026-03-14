import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }
}

export const aiConfigService = {
  async get() {
    const res = await fetch(`${BASE_URL}/ai-config/`, { headers: authHeaders() })
    if (res.status === 404) return null
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to load AI config')
    return res.json()
  },

  async save(config) {
    const res = await fetch(`${BASE_URL}/ai-config/`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(config),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to save AI config')
    return res.json()
  },
}
