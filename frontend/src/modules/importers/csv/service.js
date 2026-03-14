import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token}` }
}

export const csvService = {
  async preview(file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/importers/csv/preview`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Preview failed')
    return res.json() // { transactions: [...] }
  },

  async import(transactions) {
    const res = await fetch(`${BASE_URL}/importers/csv/import`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Import failed')
    return res.json()
  },
}
