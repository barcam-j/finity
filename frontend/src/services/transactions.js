import { api } from './api'

export const transactionsService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/transactions${query ? `?${query}` : ''}`)
  },
  delete: (id) => api.delete(`/transactions/${id}`),
}
