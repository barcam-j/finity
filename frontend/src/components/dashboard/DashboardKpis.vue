<template>
  <div class="dashboard-kpis">
    <div class="kpis-header">
      <h2>{{ t('dashboard.overview') }}</h2>
      <div class="period-selector">
        <div v-if="availableMonths.length" class="month-nav">
          <button :disabled="monthIndex >= availableMonths.length - 1 || loading" @click="stepMonth(1)">‹</button>
          <span class="month-nav-label">{{ monthLabel }}</span>
          <button :disabled="monthIndex <= 0 || loading" @click="stepMonth(-1)">›</button>
        </div>
        <button :class="{ active: period === 'all' }" :disabled="loading" @click="emit('update:period', 'all')">
          {{ t('dashboard.allTime') }}
        </button>
      </div>
    </div>

    <p v-if="!loading && localePeriodLabel" class="period-meta">
      {{ localePeriodLabel }}
      <span v-if="kpis?.last_import_date" class="period-import">
        {{ t('dashboard.importedOn', { date: formatDate(kpis.last_import_date) }) }}
      </span>
    </p>

    <div v-if="loading" class="kpis-loading">{{ t('dashboard.loading') }}</div>

    <div v-else-if="kpis" class="kpis-grid">
      <KpiCard
        :label="t('dashboard.balance')"
        :value="formatAmount(kpis.balance)"
        :variant="kpis.balance >= 0 ? 'positive' : 'negative'"
      />
      <KpiCard
        :label="t('dashboard.income')"
        :value="formatAmount(kpis.total_income)"
        variant="positive"
      />
      <KpiCard
        :label="t('dashboard.expenses')"
        :value="formatAmount(kpis.total_expenses)"
        variant="negative"
      />
      <KpiCard
        :label="t('dashboard.topCategory')"
        :value="kpis.top_category ?? '—'"
        :subtitle="t('dashboard.transactionCount', { count: kpis.transaction_count })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DashboardKpis } from '@/types'
import { useCurrency } from '@/composables/useCurrency'
import KpiCard from './KpiCard.vue'

const { t, locale } = useI18n()

const props = defineProps<{
  kpis: DashboardKpis | null
  period: string
  availableMonths: string[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:period': [period: string]
}>()

const { formatAmount } = useCurrency()

// Index of the currently selected month in availableMonths (sorted desc)
const monthIndex = computed(() => {
  if (props.period === 'all' || !props.availableMonths.length) return 0
  const idx = props.availableMonths.indexOf(props.period)
  return idx === -1 ? 0 : idx
})

function formatMonth(ym: string): string {
  const [year, month] = ym.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })
}

const monthLabel = computed(() => {
  const m = props.availableMonths[monthIndex.value]
  return m ? formatMonth(m) : ''
})

const localePeriodLabel = computed(() => {
  if (props.period === 'all' || !props.kpis) return null
  if (props.period === 'month') {
    return props.availableMonths[0] ? formatMonth(props.availableMonths[0]) : null
  }
  return formatMonth(props.period)
})

function stepMonth(delta: number): void {
  const next = monthIndex.value + delta
  if (next >= 0 && next < props.availableMonths.length) {
    emit('update:period', props.availableMonths[next])
  }
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.dashboard-kpis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.kpis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpis-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.2rem 0.4rem;
}

.month-nav button {
  padding: 0.15rem 0.4rem;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s;
}

.month-nav button:hover:not(:disabled) {
  color: var(--text);
}

.month-nav button:disabled {
  opacity: 0.3;
  cursor: default;
}

.month-nav-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  min-width: 9rem;
  text-align: center;
}

.period-selector > button {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.period-selector > button.active {
  background: var(--bg-secondary);
  color: var(--text);
  font-weight: 500;
}

.period-selector > button:disabled {
  opacity: 0.5;
  cursor: default;
}

.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.period-meta {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.period-import {
  font-weight: 400;
  color: var(--text-muted);
}

.kpis-loading {
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 2rem 0;
}
</style>
