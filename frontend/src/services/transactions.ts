import { api } from './api'
import type { PaginatedTransactions, Transaction } from '@/types'

export const transactionsService = {
  getAll: (params: Record<string, unknown> = {}) => {
    const qs = new URLSearchParams()
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || val === null) continue
      if (Array.isArray(val)) {
        val.forEach((v) => qs.append(key, String(v)))
      } else {
        qs.set(key, String(val))
      }
    }
    const query = qs.toString()
    return api.get<PaginatedTransactions>(`/transactions${query ? `?${query}` : ''}`)
  },
  getCategories: () => api.get<string[]>('/transactions/categories'),
  update: (id: string, data: Partial<Transaction>) =>
    api.patch<{ transaction: Transaction; auto_categorized: number }>(`/transactions/${id}`, data),
  bulkUpdateCategory: (ids: string[], category: string | null) =>
    api.post<{ updated: number; auto_categorized: number }>('/transactions/bulk-category', { ids, category }),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  deduplicate: () => api.post<{ deleted: number }>('/transactions/deduplicate', {}),
  checkDuplicates: (transactions: Array<{ date: string; amount: number; description: string }>) =>
    api.post<{ duplicate_indices: number[] }>('/transactions/check-duplicates', { transactions }),
}
