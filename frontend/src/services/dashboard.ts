import { useAuthStore } from '@/stores/auth'
import type { DashboardKpis, DashboardAnalysis } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token ?? ''}` }
}

export const dashboardService = {
  async getAvailableMonths(): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/dashboard/months`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to load available months')
    return res.json() as Promise<string[]>
  },

  async getKpis(period: string): Promise<DashboardKpis> {
    const res = await fetch(`${BASE_URL}/dashboard/kpis?period=${period}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to load KPIs')
    return res.json() as Promise<DashboardKpis>
  },

  async getAnalysis(month: string): Promise<DashboardAnalysis> {
    const res = await fetch(`${BASE_URL}/dashboard/analysis?month=${month}`, { headers: authHeaders() })
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to load analysis')
    return res.json() as Promise<DashboardAnalysis>
  },
}
