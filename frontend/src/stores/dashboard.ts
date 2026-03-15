import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardService } from '@/services/dashboard'
import type { DashboardKpis } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const kpis = ref<DashboardKpis | null>(null)
  const analysis = ref<string | null>(null)
  const analysisEnabled = ref(false)
  const period = ref<string>('month')
  const availableMonths = ref<string[]>([])
  const loadingKpis = ref(false)
  const loadingAnalysis = ref(false)
  const errorKpis = ref<string | null>(null)
  const errorAnalysis = ref<string | null>(null)

  async function fetchAvailableMonths(): Promise<void> {
    try {
      availableMonths.value = await dashboardService.getAvailableMonths()
      if (availableMonths.value.length && period.value === 'month') {
        period.value = availableMonths.value[0]
      }
    } catch {
      // non-blocking
    }
  }

  async function fetchKpis(p?: string): Promise<void> {
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

  async function fetchAnalysis(month?: string): Promise<void> {
    const target = month ?? period.value
    if (!target || target === 'all') return
    loadingAnalysis.value = true
    errorAnalysis.value = null
    try {
      const result = await dashboardService.getAnalysis(target)
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
    availableMonths,
    loadingKpis,
    loadingAnalysis,
    errorKpis,
    errorAnalysis,
    fetchAvailableMonths,
    fetchKpis,
    fetchAnalysis,
  }
})
