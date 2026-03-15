<template>
  <tr>
    <td class="col-date">{{ tx.date }}</td>
    <td>{{ tx.description || '—' }}</td>
    <td>
      <span v-if="tx.category" class="badge">{{ tx.category }}</span>
      <span v-else class="text-muted">—</span>
    </td>
    <td class="col-amount" :class="tx.amount < 0 ? 'amount--negative' : 'amount--positive'">
      {{ formatAmount(tx.amount) }}
    </td>
    <td class="col-action">
      <button class="btn-delete" :disabled="isDeleting" @click="tx.id && emit('delete', tx.id)">
        ✕
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  tx: Transaction
  isDeleting: boolean
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

const { formatAmount } = useCurrency()
</script>

<style scoped>
.col-date {
  white-space: nowrap;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.col-amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.col-action {
  width: 2rem;
  text-align: center;
}

.amount--positive {
  color: oklch(0.55 0.15 145);
}

.amount--negative {
  color: var(--error);
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.text-muted {
  color: var(--text-muted);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}

.btn-delete:hover:not(:disabled) {
  color: var(--error);
  background: var(--accent-subtle);
}

.btn-delete:disabled {
  opacity: 0.4;
}
</style>
