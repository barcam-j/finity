<template>
  <AppLayout>
    <div class="dashboard">
      <AiBanner />
      <div class="view-header">
        <h1>{{ t('dashboard.title') }}</h1>
      </div>
      <DashboardKpis
        :kpis="store.kpis"
        :period="store.period"
        :available-months="store.availableMonths"
        :loading="store.loadingKpis"
        @update:period="(p) => { store.fetchKpis(p); store.fetchAnalysis(p) }"
      />
      <AiAnalysisPanel
        :kpis="store.kpis"
        :analysis="store.analysis"
        :enabled="store.analysisEnabled"
        :loading="store.loadingAnalysis"
        :error="store.errorAnalysis"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import AiBanner from '@/components/AiBanner.vue'
import DashboardKpis from '@/components/dashboard/DashboardKpis.vue'
import AiAnalysisPanel from '@/components/dashboard/AiAnalysisPanel.vue'
import { useDashboardStore } from '@/stores/dashboard'

const { t } = useI18n()
const store = useDashboardStore()

onMounted(async () => {
  await store.fetchAvailableMonths()
  await Promise.all([store.fetchKpis(), store.fetchAnalysis()])
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-header h1 {
  margin: 0;
}
</style>
