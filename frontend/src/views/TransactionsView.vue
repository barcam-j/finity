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
          <TransactionTable
            :transactions="store.items"
            :deleting="deleting"
            @delete="remove"
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
import { useTransactionsStore } from '@/stores/transactions'

const store = useTransactionsStore()
const showImporter = ref(false)
const deleting = ref<string | null>(null)

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
  await store.fetch(1)
}

async function goTo(p: number): Promise<void> {
  await store.fetch(p)
}

async function remove(id: string): Promise<void> {
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

.btn-primary:hover {
  background: var(--btn-hover);
}
</style>
