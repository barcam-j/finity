<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th class="col-select">
            <input
              ref="headerCheckbox"
              type="checkbox"
              @click.prevent="emit('toggle-select-all')"
            />
          </th>
          <th>{{ t('transactions.date') }}</th>
          <th>{{ t('transactions.description') }}</th>
          <th>{{ t('transactions.category') }}</th>
          <th class="col-amount">{{ t('transactions.amount') }}</th>
        </tr>
      </thead>
      <TransitionGroup tag="tbody" name="row">
        <TransactionRow
          v-for="tx in transactions"
          :key="tx.id"
          :tx="tx"
          :selected="selectedIds.includes(tx.id!)"
          :categories="categories"
          @toggle-select="emit('toggle-select', $event)"
          @update="(id, field, value) => emit('update', id, field, value)"
        />
      </TransitionGroup>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Transaction } from '@/types'
import TransactionRow from './TransactionRow.vue'

const { t } = useI18n()

const props = defineProps<{
  transactions: Transaction[]
  selectedIds: string[]
  categories: string[]
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  'toggle-select-all': []
  update: [id: string, field: string, value: string | string[]]
}>()

const allSelected = computed(
  () => props.transactions.length > 0 && props.transactions.every((t) => props.selectedIds.includes(t.id!)),
)
const someSelected = computed(() => props.transactions.some((t) => props.selectedIds.includes(t.id!)))

const headerCheckbox = useTemplateRef<HTMLInputElement>('headerCheckbox')

watchEffect(() => {
  if (headerCheckbox.value) {
    headerCheckbox.value.checked = allSelected.value
    headerCheckbox.value.indeterminate = someSelected.value && !allSelected.value
  }
})
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
  padding: 0.7rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.col-select {
  width: 2.5rem;
  text-align: center;
}

.col-amount { text-align: right; }

.row-enter-active,
.row-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.row-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.row-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.row-move {
  transition: transform 0.25s ease;
}
</style>
