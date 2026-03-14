import { api } from './api'
import type { PaginatedTransactions } from '@/types'

export const transactionsService = {
  getAll: (params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return api.get<PaginatedTransactions>(`/transactions${query ? `?${query}` : ''}`)
  },
  delete: (id: string) => api.delete(`/transactions/${id}`),
}
