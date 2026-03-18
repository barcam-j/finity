import { useAuthStore } from '@/stores/auth'
import { api } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ImportLogItem {
  id: string
  source: 'csv' | 'pdf'
  count: number
  name: string | null
  created_at: string
}

export const dataService = {
  async exportCsv(): Promise<void> {
    const auth = useAuthStore()
    const res = await fetch(`${BASE_URL}/data/export/csv`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  },

  getImportLogs(): Promise<ImportLogItem[]> {
    return api.get<ImportLogItem[]>('/data/import-logs')
  },

  deleteImportLog(id: string): Promise<void> {
    return api.delete(`/data/import-logs/${id}`)
  },

  deleteAllData(): Promise<void> {
    return api.delete('/data/')
  },
}
