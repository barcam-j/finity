<template>
  <div class="analysis-panel">
    <div class="analysis-header">
      <h2>{{ t('analysis.title') }}</h2>
      <span v-if="enabled" class="ai-badge">AI</span>
    </div>

    <div v-if="loading" class="analysis-loading">
      <span class="spinner" />
      {{ t('analysis.loading') }}
    </div>

    <template v-else-if="kpis && kpis.transaction_count > 0">
      <!-- AI analysis -->
      <div v-if="enabled && analysis" class="analysis-content">{{ analysis }}</div>
      <div v-if="enabled && error" class="analysis-error">{{ error }}</div>

      <!-- Basic analysis — always shown -->
      <div class="basic-analysis">
        <p class="basic-summary">
          <template v-if="kpis.balance >= 0">
            {{ t('analysis.youreAhead') }}
            <strong class="positive">{{ t('analysis.aheadBy', { amount: formatAmount(kpis.balance) }) }}</strong>
            {{ t('analysis.inAndOut', { income: formatAmount(kpis.total_income), expenses: formatAmount(kpis.total_expenses), count: kpis.transaction_count }) }}
          </template>
          <template v-else>
            {{ t('analysis.youreAhead') }}
            <strong class="negative">{{ t('analysis.overBudget', { amount: formatAmount(Math.abs(kpis.balance)) }) }}</strong>
            {{ t('analysis.inAndOut', { income: formatAmount(kpis.total_income), expenses: formatAmount(kpis.total_expenses), count: kpis.transaction_count }) }}
          </template>
        </p>

        <div v-if="kpis.categories.length" class="categories">
          <p class="categories-title">{{ t('analysis.spendingByCategory') }}</p>
          <div
            v-for="cat in kpis.categories"
            :key="cat.name"
            class="category-row"
          >
            <span class="category-name">{{ cat.name }}</span>
            <div class="category-bar-wrap">
              <div class="category-bar" :style="{ width: `${cat.percentage}%` }" />
            </div>
            <span class="category-amount">{{ formatAmount(cat.total) }}</span>
            <span class="category-pct">{{ cat.percentage }}%</span>
          </div>
        </div>

        <p v-if="!enabled" class="ai-hint">
          {{ t('analysis.enableAiPrefix') }}
          <RouterLink to="/settings" class="link">{{ t('analysis.enableAiLink') }}</RouterLink>
          {{ t('analysis.enableAiSuffix') }}
        </p>
      </div>
    </template>

    <div v-else class="analysis-empty">
      {{ t('analysis.empty') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { DashboardKpis } from '@/types'
import { useCurrency } from '@/composables/useCurrency'

const { t } = useI18n()

defineProps<{
  kpis: DashboardKpis | null
  analysis: string | null
  enabled: boolean
  loading: boolean
  error?: string | null
}>()

const { formatAmount } = useCurrency()
</script>

<style scoped>
.analysis-panel {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.analysis-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--accent);
  color: #fff;
  letter-spacing: 0.05em;
}

.analysis-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analysis-error {
  font-size: 0.875rem;
  color: var(--error);
}

.analysis-content {
  font-size: 0.925rem;
  color: var(--text);
  line-height: 1.7;
  white-space: pre-wrap;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

/* Basic analysis */
.basic-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.basic-summary {
  margin: 0;
  font-size: 0.925rem;
  color: var(--text);
  line-height: 1.6;
}

.positive { color: oklch(0.55 0.15 145); }
.negative { color: var(--error); }

.categories-title {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.category-row {
  display: grid;
  grid-template-columns: 8rem 1fr 5rem 2.5rem;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.category-name {
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-bar-wrap {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 99px;
  overflow: hidden;
}

.category-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.category-amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.category-pct {
  text-align: right;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.ai-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.link {
  color: var(--accent);
  text-underline-offset: 2px;
}

.analysis-empty {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>
