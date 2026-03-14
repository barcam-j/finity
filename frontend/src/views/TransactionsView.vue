<template>
  <AppLayout>
    <div class="transactions-view">
      <div class="view-header">
        <h1>Transactions</h1>
        <button class="btn-primary" @click="showImporter = !showImporter">
          {{ showImporter ? 'Cancel' : 'Import' }}
        </button>
      </div>

      <div v-if="showImporter" class="importer-panel">
        <ImporterSelector @done="onImportDone" />
      </div>

      <div v-else class="empty-state">
        <p>No transactions yet. Import a file to get started.</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ImporterSelector from '@/modules/importers/ImporterSelector.vue'

const showImporter = ref(false)

function onImportDone() {
  showImporter.value = false
}
</script>

<style scoped>
.transactions-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.empty-state {
  color: var(--text-muted);
  font-size: 0.95rem;
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
