<template>
  <AppLayout>
    <div class="transactions-view">
      <AiBanner />

      <div class="view-header">
        <button class="btn-primary" @click="toggleImporter">
          {{ showImporter ? 'Cancel' : 'Import' }}
        </button>
      </div>

      <div v-if="showImporter" class="importer-panel">
        <ImporterSelector @done="onImportDone" />
      </div>

      <template v-else>
        <div v-if="store.loading && !store.items.length" class="state-msg">Loading…</div>

        <template v-else-if="store.items.length">
          <TransactionFilters
            :categories="store.categories"
            @filter="onFiltersChange"
          />
          <BulkEditBar
            :count="selectedIds.length"
            :categories="store.categories"
            @apply-category="onBulkCategory"
            @delete-selected="onBulkDelete"
            @clear-selection="selectedIds = []"
          />
          <TransactionTable
            :transactions="store.items"
            :selected-ids="selectedIds"
            :categories="store.categories"
            @toggle-select="toggleSelect"
            @toggle-select-all="toggleSelectAll"
            @update="onUpdate"
          />
          <TransactionPagination
            :page="store.page"
            :pages="store.pages"
            :total="store.total"
            :visible-pages="visiblePages"
            @go-to="goTo"
          />
        </template>

        <TransactionsEmptyState v-else @import="toggleImporter" />
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ImporterSelector from '@/modules/importers/ImporterSelector.vue'
import AiBanner from '@/components/AiBanner.vue'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionPagination from '@/components/transactions/TransactionPagination.vue'
import TransactionsEmptyState from '@/components/transactions/TransactionsEmptyState.vue'
import BulkEditBar from '@/components/transactions/BulkEditBar.vue'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import type { TransactionFilters as TFilters } from '@/types'
import { useTransactionsStore } from '@/stores/transactions'

const store = useTransactionsStore()
const showImporter = ref(false)
const selectedIds = ref<string[]>([])
const currentFilters = ref<TFilters>({})

const visiblePages = computed(() => {
  const { page, pages } = store
  const range: number[] = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
    range.push(i)
  }
  return range
})

function toggleImporter(): void {
  showImporter.value = !showImporter.value
}

async function onImportDone(): Promise<void> {
  showImporter.value = false
  selectedIds.value = []
  await Promise.all([store.fetch(1), store.fetchCategories()])
}

function onFiltersChange(filters: TFilters): void {
  currentFilters.value = filters
  selectedIds.value = []
  store.fetch(1, filters)
}

async function goTo(p: number): Promise<void> {
  selectedIds.value = []
  await store.fetch(p, currentFilters.value)
}

function toggleSelect(id: string): void {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

function toggleSelectAll(): void {
  const pageIds = store.items.map((t) => t.id!)
  const allSelected = pageIds.every((id) => selectedIds.value.includes(id))
  if (allSelected) {
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  } else {
    pageIds.forEach((id) => {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    })
  }
}

async function onUpdate(id: string, field: string, value: string | string[]): Promise<void> {
  await store.updateTransaction(id, { [field]: value })
}

async function onBulkCategory(category: string): Promise<void> {
  await store.bulkUpdateCategory(selectedIds.value, category)
  selectedIds.value = []
}

async function onBulkDelete(): Promise<void> {
  const ids = [...selectedIds.value]
  selectedIds.value = []
  await store.bulkRemove(ids)
}

onMounted(() => Promise.all([store.fetch(1), store.fetchCategories()]))
</script>

<style scoped>
.transactions-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-header h1 { margin: 0; }

.importer-panel {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.state-msg {
  color: var(--text-muted);
  font-size: 0.95rem;
  padding: 2rem 0;
}

.btn-primary {
  padding: 0.6rem 1.25rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover { background: var(--btn-hover); }
</style>
