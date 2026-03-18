import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/errors'
import type { PreviewResponse, ImportResponse, Transaction } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token ?? ''}` }
}

export const pdfService = {
  async preview(file: File): Promise<PreviewResponse> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/importers/pdf/preview`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    })
    if (!res.ok) {
      const body = await res.json()
      throw new ApiError(body.detail || 'Preview failed', res.status)
    }
    return res.json() as Promise<PreviewResponse>
  },

  async import(transactions: Transaction[], name?: string): Promise<ImportResponse> {
    const res = await fetch(`${BASE_URL}/importers/pdf/import`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, name: name || null }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Import failed')
    return res.json() as Promise<ImportResponse>
  },
}
