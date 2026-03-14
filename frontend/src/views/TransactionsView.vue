<template>
  <AppLayout>
    <div class="transactions-view">
      <AiBanner />

      <div class="view-header">
        <h1>Transactions</h1>
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
                <tr v-for="tx in store.items" :key="tx.id">
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
                    <button class="btn-delete" :disabled="deleting === tx.id" @click="remove(tx.id)">
                      ✕
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <span class="pagination-info">
              {{ (store.page - 1) * 20 + 1 }}–{{ Math.min(store.page * 20, store.total) }}
              of {{ store.total }} transactions
            </span>
            <div class="pagination-controls">
              <button :disabled="store.page <= 1" @click="goTo(store.page - 1)">←</button>
              <button
                v-for="p in visiblePages"
                :key="p"
                :class="{ active: p === store.page }"
                @click="goTo(p)"
              >
                {{ p }}
              </button>
              <button :disabled="store.page >= store.pages" @click="goTo(store.page + 1)">→</button>
            </div>
          </div>
        </template>

        <div v-else class="state-msg">
          No transactions yet.
          <button class="link-btn" @click="toggleImporter">Import a file</button>
          to get started.
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ImporterSelector from '@/modules/importers/ImporterSelector.vue'
import AiBanner from '@/components/AiBanner.vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useCurrency } from '@/composables/useCurrency'

const store = useTransactionsStore()
const { formatAmount } = useCurrency()
const showImporter = ref(false)
const deleting = ref(null)

const visiblePages = computed(() => {
  const { page, pages } = store
  const range = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
    range.push(i)
  }
  return range
})


function toggleImporter() {
  showImporter.value = !showImporter.value
}

async function onImportDone() {
  showImporter.value = false
  await store.fetch(1)
}

async function goTo(p) {
  await store.fetch(p)
}

async function remove(id) {
  deleting.value = id
  try {
    await store.remove(id)
  } finally {
    deleting.value = null
  }
}

onMounted(() => store.fetch(1))
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

.view-header h1 {
  margin: 0;
}

.importer-panel {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

/* Table */
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

/* Pagination */
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

/* States */
.state-msg {
  color: var(--text-muted);
  font-size: 0.95rem;
  padding: 2rem 0;
}

/* Buttons */
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

.btn-primary:hover {
  background: var(--btn-hover);
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

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
