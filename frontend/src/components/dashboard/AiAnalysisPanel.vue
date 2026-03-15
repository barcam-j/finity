<template>
  <div class="analysis-panel">
    <h2>AI Analysis</h2>

    <div v-if="!enabled" class="analysis-disabled">
      AI analysis is disabled. Enable it in
      <RouterLink to="/settings" class="link">Settings → AI Provider</RouterLink>.
    </div>

    <div v-else-if="loading" class="analysis-loading">
      <span class="spinner" />
      Analyzing your transactions…
    </div>

    <div v-else-if="error" class="analysis-error">{{ error }}</div>

    <div v-else-if="analysis" class="analysis-content">{{ analysis }}</div>

    <div v-else class="analysis-empty">No transactions to analyze yet.</div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  analysis: string | null
  enabled: boolean
  loading: boolean
  error?: string | null
}>()
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
  gap: 1rem;
}

.analysis-panel h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analysis-disabled,
.analysis-empty {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.link {
  color: var(--accent);
  text-underline-offset: 2px;
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
  font-size: 0.9rem;
  color: var(--error);
}

.analysis-content {
  font-size: 0.925rem;
  color: var(--text);
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
