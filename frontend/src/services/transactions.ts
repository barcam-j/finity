import { api } from './api'
import type { PaginatedTransactions, Transaction } from '@/types'

export const transactionsService = {
  getAll: (params: Record<string, unknown> = {}) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return api.get<PaginatedTransactions>(`/transactions${query ? `?${query}` : ''}`)
  },
  getCategories: () => api.get<string[]>('/transactions/categories'),
  update: (id: string, data: Partial<Transaction>) =>
    api.patch<Transaction>(`/transactions/${id}`, data),
  bulkUpdateCategory: (ids: string[], category: string | null) =>
    api.post<{ updated: number }>('/transactions/bulk-category', { ids, category }),
  delete: (id: string) => api.delete(`/transactions/${id}`),
}
