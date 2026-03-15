<template>
  <div class="dashboard-kpis">
    <div class="kpis-header">
      <h2>Overview</h2>
      <div class="period-selector">
        <button :class="{ active: period === 'month' }" @click="emit('update:period', 'month')">
          Last month
        </button>
        <button :class="{ active: period === 'all' }" @click="emit('update:period', 'all')">
          All time
        </button>
      </div>
    </div>

    <p v-if="!loading && kpis?.period_label" class="period-meta">
      {{ kpis.period_label }}
      <span v-if="kpis.last_import_date" class="period-import">
        · Imported on {{ formatDate(kpis.last_import_date) }}
      </span>
    </p>

    <div v-if="loading" class="kpis-loading">Loading…</div>

    <div v-else-if="kpis" class="kpis-grid">
      <KpiCard
        label="Balance"
        :value="formatAmount(kpis.balance)"
        :variant="kpis.balance >= 0 ? 'positive' : 'negative'"
      />
      <KpiCard
        label="Income"
        :value="formatAmount(kpis.total_income)"
        variant="positive"
      />
      <KpiCard
        label="Expenses"
        :value="formatAmount(kpis.total_expenses)"
        variant="negative"
      />
      <KpiCard
        label="Top category"
        :value="kpis.top_category ?? '—'"
        :subtitle="`${kpis.transaction_count} transactions`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardKpis } from '@/types'
import { useCurrency } from '@/composables/useCurrency'
import KpiCard from './KpiCard.vue'

defineProps<{
  kpis: DashboardKpis | null
  period: 'month' | 'all'
  loading: boolean
}>()

const emit = defineEmits<{
  'update:period': [period: 'month' | 'all']
}>()

const { formatAmount } = useCurrency()

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
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
  gap: 0.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.2rem;
}

.period-selector button {
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.period-selector button.active {
  background: var(--card-bg);
  color: var(--text);
  font-weight: 500;
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.1);
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
