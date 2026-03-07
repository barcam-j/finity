import { api } from './api'

export const transactionsService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/transactions${query ? `?${query}` : ''}`)
  },
  upload: (formData) => {
    const auth = useAuthStore()
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/transactions/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: formData,
    }).then((r) => r.json())
  },
  delete: (id) => api.delete(`/transactions/${id}`),
}
