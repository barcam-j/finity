<template>
  <div class="kpi-card" :class="{ 'kpi-card--clickable': clickable }">
    <span class="kpi-label">{{ label }}</span>
    <span class="kpi-value" :class="variant ? `kpi-value--${variant}` : ''">{{ value }}</span>
    <span v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  subtitle?: string
  variant?: 'positive' | 'negative' | 'neutral'
  clickable?: boolean
}>()
</script>

<style scoped>
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.25rem 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  line-height: 1.2;
}

.kpi-value--positive {
  color: oklch(0.55 0.15 145);
}

.kpi-value--negative {
  color: var(--error);
}

.kpi-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.kpi-card--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.kpi-card--clickable:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
</style>
