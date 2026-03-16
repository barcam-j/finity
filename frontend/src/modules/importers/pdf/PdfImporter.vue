<template>
  <div class="pdf-importer">
    <!-- Step 1: Upload -->
    <div v-if="step === 'upload'">
      <AiBanner class="banner" />
      <div
        class="drop-zone"
        :class="{ 'drop-zone--active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".pdf" hidden @change="onFileChange" />
        <p class="drop-zone__icon">📄</p>
        <p class="drop-zone__text">{{ t('importer.dropPdfHere') }} <span>{{ t('importer.clickBrowse') }}</span></p>
        <p class="drop-zone__hint">{{ t('importer.hintPdf') }}</p>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- Step 2: Parsing (loading) -->
    <div v-else-if="step === 'parsing'" class="parsing">
      <div class="spinner" />
      <p>{{ t('importer.readingTransactionsFrom') }} <strong>{{ fileName }}</strong>…</p>
      <p class="parsing-hint">{{ t('importer.aiInterpreting') }}</p>
    </div>

    <!-- Step 3: Preview -->
    <div v-else-if="step === 'preview'">
      <div class="step-header">
        <div>
          <h3>{{ t('importer.preview') }}</h3>
          <p class="step-subtitle">
            {{ t('importer.transactionsFound', { count: rows.length }) }} <strong>{{ fileName }}</strong>
            <span v-if="rows.length < totalParsed" class="removed-badge">
              {{ t('importer.removed', { count: totalParsed - rows.length }) }}
            </span>
          </p>
        </div>
        <button class="btn-secondary" @click="reset">{{ t('importer.changeFile') }}</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>{{ t('importer.date') }}</th>
              <th>{{ t('importer.description') }}</th>
              <th>{{ t('importer.category') }}</th>
              <th class="col-amount">{{ t('importer.amount') }}</th>
              <th class="col-action"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in pageRows" :key="i">
              <td class="col-date">{{ row.date }}</td>
              <td>{{ row.description || '—' }}</td>
              <td>
                <span v-if="row.category" class="badge">{{ row.category }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="col-amount" :class="row.amount < 0 ? 'amount--negative' : 'amount--positive'">
                {{ formatAmount(row.amount) }}
              </td>
              <td class="col-action">
                <button class="btn-delete" @click="removeRow(previewPage, i)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span class="pagination-info">
          {{ (previewPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(previewPage * PAGE_SIZE, rows.length) }}
          of {{ rows.length }}
        </span>
        <div class="pagination-controls">
          <button :disabled="previewPage <= 1" @click="previewPage--">←</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            :class="{ active: p === previewPage }"
            @click="previewPage = p"
          >{{ p }}</button>
          <button :disabled="previewPage >= totalPages" @click="previewPage++">→</button>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="step-actions">
        <button class="btn-primary" :disabled="importing || !rows.length" @click="confirmImport">
          {{ importing ? t('importer.importing') : t('importer.importCount', { count: rows.length }) }}
        </button>
      </div>
    </div>

    <!-- Step 4: Success -->
    <div v-else-if="step === 'success'" class="success">
      <p class="success__icon">✓</p>
      <h3>{{ t('importer.importComplete') }}</h3>
      <p>{{ t('importer.importedSuccess', { count: importedCount }) }}</p>
      <button class="btn-primary" @click="reset">{{ t('importer.importAnother') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pdfService } from './service'
import AiBanner from '@/components/AiBanner.vue'
import { useCurrency } from '@/composables/useCurrency'

const { t } = useI18n()
const { formatAmount } = useCurrency()
const PAGE_SIZE = 20

const step = ref('upload')
const isDragging = ref(false)
const fileInput = ref(null)
const fileName = ref('')
const rows = ref([])
const totalParsed = ref(0)
const previewPage = ref(1)
const importing = ref(false)
const error = ref(null)
const importedCount = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(rows.value.length / PAGE_SIZE)))
const pageRows = computed(() => {
  const start = (previewPage.value - 1) * PAGE_SIZE
  return rows.value.slice(start, start + PAGE_SIZE)
})
const visiblePages = computed(() => {
  const range = []
  const delta = 2
  for (let i = Math.max(1, previewPage.value - delta); i <= Math.min(totalPages.value, previewPage.value + delta); i++) {
    range.push(i)
  }
  return range
})

function removeRow(page, indexInPage) {
  const globalIndex = (page - 1) * PAGE_SIZE + indexInPage
  rows.value.splice(globalIndex, 1)
  if (previewPage.value > totalPages.value) previewPage.value = totalPages.value
}

function reset() {
  step.value = 'upload'
  rows.value = []
  totalParsed.value = 0
  previewPage.value = 1
  error.value = null
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function loadFile(file) {
  error.value = null
  fileName.value = file.name
  step.value = 'parsing'

  try {
    const { transactions } = await pdfService.preview(file)
    if (!transactions?.length) {
      error.value = t('importer.errorNoTransactions')
      step.value = 'upload'
      return
    }
    rows.value = transactions
    totalParsed.value = transactions.length
    previewPage.value = 1
    step.value = 'preview'
  } catch (e) {
    error.value = e.status === 429
      ? t('importer.errorRateLimit')
      : e.message
    step.value = 'upload'
  }
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) loadFile(file)
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) loadFile(file)
}

async function confirmImport() {
  error.value = null
  importing.value = true
  try {
    const data = await pdfService.import(rows.value)
    importedCount.value = data.imported
    step.value = 'success'
  } catch (e) {
    error.value = e.message
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.pdf-importer {
  width: 100%;
}

.banner {
  margin-bottom: 1rem;
}

/* Drop zone */
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.drop-zone__icon {
  font-size: 2.5rem;
  margin: 0 0 0.75rem;
}

.drop-zone__text {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: 1rem;
}

.drop-zone__text span {
  color: var(--accent);
  font-weight: 500;
}

.drop-zone__hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Parsing state */
.parsing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text);
}

.parsing-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Step header */
.step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.step-header h3 {
  margin: 0 0 0.25rem;
}

.step-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  background: var(--bg-secondary);
  padding: 0.6rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

td {
  padding: 0.6rem 1rem;
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

.removed-badge {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--error);
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

.btn-delete:hover {
  color: var(--error);
  background: var(--accent-subtle);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
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

/* Actions */
.step-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
}

/* Success */
.success {
  text-align: center;
  padding: 2rem;
}

.success__icon {
  font-size: 2.5rem;
  color: var(--accent);
  margin: 0 0 0.5rem;
}

.success h3 {
  margin: 0 0 0.5rem;
}

.success p {
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

/* Buttons */
.btn-primary {
  padding: 0.65rem 1.5rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--btn-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.6rem 1rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.btn-secondary:hover {
  border-color: var(--text);
  color: var(--text);
}

.error {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.75rem;
}
</style>
