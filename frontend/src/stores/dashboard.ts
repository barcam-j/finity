import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardService } from '@/services/dashboard'
import type { DashboardKpis } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const kpis = ref<DashboardKpis | null>(null)
  const analysis = ref<string | null>(null)
  const analysisEnabled = ref(false)
  const period = ref<'month' | 'all'>('month')
  const loadingKpis = ref(false)
  const loadingAnalysis = ref(false)
  const errorKpis = ref<string | null>(null)
  const errorAnalysis = ref<string | null>(null)

  async function fetchKpis(p?: 'month' | 'all'): Promise<void> {
    if (p) period.value = p
    loadingKpis.value = true
    errorKpis.value = null
    try {
      kpis.value = await dashboardService.getKpis(period.value)
    } catch (e) {
      errorKpis.value = (e as Error).message
    } finally {
      loadingKpis.value = false
    }
  }

  async function fetchAnalysis(): Promise<void> {
    loadingAnalysis.value = true
    errorAnalysis.value = null
    try {
      const result = await dashboardService.getAnalysis()
      analysis.value = result.analysis
      analysisEnabled.value = result.enabled
    } catch (e) {
      errorAnalysis.value = (e as Error).message
    } finally {
      loadingAnalysis.value = false
    }
  }

  return {
    kpis,
    analysis,
    analysisEnabled,
    period,
    loadingKpis,
    loadingAnalysis,
    errorKpis,
    errorAnalysis,
    fetchKpis,
    fetchAnalysis,
  }
})
