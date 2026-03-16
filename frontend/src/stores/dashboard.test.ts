import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from './dashboard'
import type { DashboardKpis } from '@/types'

vi.mock('@/services/dashboard', () => ({
  dashboardService: {
    getAvailableMonths: vi.fn(),
    getKpis: vi.fn(),
    getAnalysis: vi.fn(),
  },
}))

import { dashboardService } from '@/services/dashboard'

const mockKpis: DashboardKpis = {
  total_income: 1000,
  total_expenses: 600,
  balance: 400,
  top_category: 'Food',
  transaction_count: 10,
  categories: [],
  period_label: 'March 2024',
  last_import_date: '2024-03-15',
}

describe('useDashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── fetchAvailableMonths ───────────────────────────────────────────────────

  describe('fetchAvailableMonths', () => {
    it('stores the returned months', async () => {
      vi.mocked(dashboardService.getAvailableMonths).mockResolvedValue(['2024-03', '2024-02'])
      const store = useDashboardStore()

      await store.fetchAvailableMonths()

      expect(store.availableMonths).toEqual(['2024-03', '2024-02'])
    })

    it('auto-selects the first month when period is "month"', async () => {
      vi.mocked(dashboardService.getAvailableMonths).mockResolvedValue(['2024-03', '2024-02'])
      const store = useDashboardStore()
      expect(store.period).toBe('month')

      await store.fetchAvailableMonths()

      expect(store.period).toBe('2024-03')
    })

    it('does not override a manually selected period', async () => {
      vi.mocked(dashboardService.getAvailableMonths).mockResolvedValue(['2024-03', '2024-02'])
      const store = useDashboardStore()
      store.period = '2024-02'

      await store.fetchAvailableMonths()

      expect(store.period).toBe('2024-02')
    })

    it('does not throw when service fails', async () => {
      vi.mocked(dashboardService.getAvailableMonths).mockRejectedValue(new Error('Network error'))
      const store = useDashboardStore()

      await expect(store.fetchAvailableMonths()).resolves.toBeUndefined()
    })
  })

  // ── fetchKpis ──────────────────────────────────────────────────────────────

  describe('fetchKpis', () => {
    it('stores the returned KPIs', async () => {
      vi.mocked(dashboardService.getKpis).mockResolvedValue(mockKpis)
      const store = useDashboardStore()

      await store.fetchKpis()

      expect(store.kpis).toEqual(mockKpis)
    })

    it('updates period when a new one is passed', async () => {
      vi.mocked(dashboardService.getKpis).mockResolvedValue(mockKpis)
      const store = useDashboardStore()

      await store.fetchKpis('2024-02')

      expect(store.period).toBe('2024-02')
    })

    it('resets loading to false after success', async () => {
      vi.mocked(dashboardService.getKpis).mockResolvedValue(mockKpis)
      const store = useDashboardStore()

      await store.fetchKpis()

      expect(store.loadingKpis).toBe(false)
    })

    it('sets errorKpis and resets loading on failure', async () => {
      vi.mocked(dashboardService.getKpis).mockRejectedValue(new Error('Server error'))
      const store = useDashboardStore()

      await store.fetchKpis()

      expect(store.errorKpis).toBe('Server error')
      expect(store.loadingKpis).toBe(false)
    })
  })

  // ── fetchAnalysis ──────────────────────────────────────────────────────────

  describe('fetchAnalysis', () => {
    it('stores analysis text and enabled flag on success', async () => {
      vi.mocked(dashboardService.getAnalysis).mockResolvedValue({ analysis: 'Good month', enabled: true })
      const store = useDashboardStore()
      store.period = '2024-03'

      await store.fetchAnalysis()

      expect(store.analysis).toBe('Good month')
      expect(store.analysisEnabled).toBe(true)
    })

    it('skips the request when period is "all"', async () => {
      const store = useDashboardStore()
      store.period = 'all'

      await store.fetchAnalysis()

      expect(dashboardService.getAnalysis).not.toHaveBeenCalled()
    })

    it('uses the passed month over the current period', async () => {
      vi.mocked(dashboardService.getAnalysis).mockResolvedValue({ analysis: null, enabled: false })
      const store = useDashboardStore()
      store.period = '2024-03'

      await store.fetchAnalysis('2024-01')

      expect(dashboardService.getAnalysis).toHaveBeenCalledWith('2024-01')
    })

    it('sets errorAnalysis and resets loading on failure', async () => {
      vi.mocked(dashboardService.getAnalysis).mockRejectedValue(new Error('AI unavailable'))
      const store = useDashboardStore()
      store.period = '2024-03'

      await store.fetchAnalysis()

      expect(store.errorAnalysis).toBe('AI unavailable')
      expect(store.loadingAnalysis).toBe(false)
    })
  })
})
