<template>
  <AppLayout>
    <div class="transactions-view">
      <AiBanner />

      <div class="view-header">
        <button class="btn-primary" @click="toggleImporter">
          {{ showImporter ? t('transactions.cancel') : t('transactions.import') }}
        </button>
        <div class="view-header-actions">
          <span v-if="deduplicateResult !== null" class="deduplicate-result">
            {{ t('transactions.deduplicateResult', { count: deduplicateResult }) }}
          </span>
          <button v-if="!showImporter && store.items.length" class="btn-secondary" @click="showDeduplicateConfirm = true">
            {{ t('transactions.deduplicate') }}
          </button>
        </div>
      </div>

      <div v-if="showImporter" class="importer-panel">
        <ImporterSelector @done="onImportDone" />
      </div>

      <template v-else>
        <div v-if="store.loading && !store.items.length" class="state-msg">{{ t('transactions.loading') }}</div>

        <template v-else-if="store.items.length || hasActiveFilters">
          <div v-if="autoCategorizedCount !== null" class="auto-cat-notice">
            {{ t('transactions.autoCategorized', { count: autoCategorizedCount }) }}
          </div>
          <TransactionFilters
            :categories="store.categories"
            :initial-filters="currentFilters"
            @filter="onFiltersChange"
          />
          <BulkEditBar
            :count="selectedIds.length"
            :categories="store.categories"
            @apply-category="onBulkCategory"
            @delete-selected="onBulkDelete"
            @clear-selection="selectedIds = []"
          />
          <template v-if="store.items.length">
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
          <div v-else class="state-msg">{{ t('transactions.noResults') }}</div>
        </template>

        <TransactionsEmptyState v-else @import="toggleImporter" />
      </template>
    </div>
  </AppLayout>

  <ConfirmDialog
    :open="showDeleteConfirm"
    :message="t('transactions.deleteConfirm', selectedIds.length, { named: { count: selectedIds.length } })"
    :confirm-label="t('transactions.deleteSelected')"
    @confirm="confirmBulkDelete"
    @cancel="showDeleteConfirm = false"
  />

  <ConfirmDialog
    :open="showDeduplicateConfirm"
    :message="t('transactions.deduplicateConfirm')"
    :confirm-label="t('transactions.deduplicateRun')"
    @confirm="confirmDeduplicate"
    @cancel="showDeduplicateConfirm = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import ImporterSelector from '@/modules/importers/ImporterSelector.vue'
import AiBanner from '@/components/AiBanner.vue'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionPagination from '@/components/transactions/TransactionPagination.vue'
import TransactionsEmptyState from '@/components/transactions/TransactionsEmptyState.vue'
import BulkEditBar from '@/components/transactions/BulkEditBar.vue'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import type { TransactionFilters as TFilters } from '@/types'
import { useTransactionsStore } from '@/stores/transactions'

const { t } = useI18n()
const route = useRoute()
const store = useTransactionsStore()
const showImporter = ref(false)
const selectedIds = ref<string[]>([])

function filtersFromQuery(): TFilters {
  const q = route.query
  const filters: TFilters = {}
  if (q.amount_max) filters.amount_max = Number(q.amount_max)
  if (q.amount_min) filters.amount_min = Number(q.amount_min)
  if (q.date_from) filters.date_from = String(q.date_from)
  if (q.date_to) filters.date_to = String(q.date_to)
  if (q.search) filters.search = String(q.search)
  if (q.categories) {
    filters.categories = Array.isArray(q.categories)
      ? q.categories.map(String)
      : [String(q.categories)]
  }
  return filters
}

const currentFilters = ref<TFilters>(filtersFromQuery())
const showDeleteConfirm = ref(false)
const showDeduplicateConfirm = ref(false)
const deduplicateResult = ref<number | null>(null)
const autoCategorizedCount = ref<number | null>(null)

const hasActiveFilters = computed(() => {
  const f = currentFilters.value
  return !!(f.search || f.categories?.length || f.date_from || f.date_to || f.amount_min !== undefined || f.amount_max !== undefined)
})

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
  const count = await store.updateTransaction(id, { [field]: value })
  if (count > 0) {
    autoCategorizedCount.value = count
    setTimeout(() => { autoCategorizedCount.value = null }, 4000)
  }
}

async function onBulkCategory(category: string): Promise<void> {
  const count = await store.bulkUpdateCategory(selectedIds.value, category)
  selectedIds.value = []
  if (count > 0) {
    autoCategorizedCount.value = count
    setTimeout(() => { autoCategorizedCount.value = null }, 4000)
  }
}

async function onBulkDelete(): Promise<void> {
  showDeleteConfirm.value = true
}

async function confirmBulkDelete(): Promise<void> {
  showDeleteConfirm.value = false
  const ids = [...selectedIds.value]
  selectedIds.value = []
  await store.bulkRemove(ids)
}

async function confirmDeduplicate(): Promise<void> {
  showDeduplicateConfirm.value = false
  deduplicateResult.value = await store.deduplicate()
}

onMounted(() => Promise.all([store.fetch(1, currentFilters.value), store.fetchCategories()]))
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

.view-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.deduplicate-result {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.auto-cat-notice {
  padding: 0.6rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--accent);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text);
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

.btn-secondary {
  padding: 0.6rem 1.25rem;
  background: none;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
</style>
