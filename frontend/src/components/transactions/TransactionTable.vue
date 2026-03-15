<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th class="col-amount">Amount</th>
          <th class="col-action"></th>
        </tr>
      </thead>
      <tbody>
        <TransactionRow
          v-for="tx in transactions"
          :key="tx.id"
          :tx="tx"
          :is-deleting="deleting === tx.id"
          @delete="emit('delete', $event)"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'
import TransactionRow from './TransactionRow.vue'

defineProps<{
  transactions: Transaction[]
  deleting: string | null
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-bg);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  background: var(--bg-secondary);
  padding: 0.65rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

td {
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--border);
  color: var(--text);
}

.col-amount {
  text-align: right;
}

.col-action {
  width: 2rem;
  text-align: center;
}
</style>
