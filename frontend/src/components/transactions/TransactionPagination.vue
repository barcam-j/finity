<template>
  <div class="pagination">
    <span class="pagination-info">
      {{ (page - 1) * 20 + 1 }}–{{ Math.min(page * 20, total) }}
      of {{ total }} transactions
    </span>
    <div class="pagination-controls">
      <button :disabled="page <= 1" @click="emit('go-to', page - 1)">←</button>
      <button
        v-for="p in visiblePages"
        :key="p"
        :class="{ active: p === page }"
        @click="emit('go-to', p)"
      >
        {{ p }}
      </button>
      <button :disabled="page >= pages" @click="emit('go-to', page + 1)">→</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number
  pages: number
  total: number
  visiblePages: number[]
}>()

const emit = defineEmits<{
  'go-to': [page: number]
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
}

.pagination-controls button {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.pagination-controls button:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.pagination-controls button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.pagination-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
