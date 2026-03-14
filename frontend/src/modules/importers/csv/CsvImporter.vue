<template>
  <div class="csv-importer">
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
        <input ref="fileInput" type="file" accept=".csv" hidden @change="onFileChange" />
        <p class="drop-zone__icon">📄</p>
        <p class="drop-zone__text">Drop your CSV here or <span>click to browse</span></p>
        <p class="drop-zone__hint">Any format — AI will read and extract the transactions</p>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- Step 2: Parsing (loading) -->
    <div v-else-if="step === 'parsing'" class="parsing">
      <div class="spinner" />
      <p>Reading transactions from <strong>{{ fileName }}</strong>…</p>
      <p class="parsing-hint">AI is interpreting the file, this may take a few seconds</p>
    </div>

    <!-- Step 3: Preview -->
    <div v-else-if="step === 'preview'">
      <div class="step-header">
        <div>
          <h3>Preview</h3>
          <p class="step-subtitle">
            {{ rows.length }} transactions found in <strong>{{ fileName }}</strong>
          </p>
        </div>
        <button class="btn-secondary" @click="reset">Change file</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in previewRows" :key="i">
              <td>{{ row.date }}</td>
              <td :class="row.amount < 0 ? 'amount--negative' : 'amount--positive'">
                {{ formatAmount(row.amount) }}
              </td>
              <td>{{ row.description || '—' }}</td>
              <td>{{ row.category || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="rows.length > PREVIEW_LIMIT" class="preview-more">
          Showing {{ PREVIEW_LIMIT }} of {{ rows.length }} rows
        </p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="step-actions">
        <button class="btn-primary" :disabled="importing" @click="confirmImport">
          {{ importing ? 'Importing…' : `Import ${rows.length} transactions` }}
        </button>
      </div>
    </div>

    <!-- Step 4: Success -->
    <div v-else-if="step === 'success'" class="success">
      <p class="success__icon">✓</p>
      <h3>Import complete</h3>
      <p>{{ importedCount }} transactions imported successfully.</p>
      <button class="btn-primary" @click="reset">Import another file</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { csvService } from './service'
import AiBanner from '@/components/AiBanner.vue'

const PREVIEW_LIMIT = 10

const step = ref('upload')
const isDragging = ref(false)
const fileInput = ref(null)
const fileName = ref('')
const rows = ref([])
const importing = ref(false)
const error = ref(null)
const importedCount = ref(0)

const previewRows = computed(() => rows.value.slice(0, PREVIEW_LIMIT))

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function reset() {
  step.value = 'upload'
  rows.value = []
  error.value = null
  fileName.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function loadFile(file) {
  error.value = null
  fileName.value = file.name
  step.value = 'parsing'

  try {
    const { transactions } = await csvService.preview(file)
    if (!transactions?.length) {
      error.value = 'No transactions found in file'
      step.value = 'upload'
      return
    }
    rows.value = transactions
    step.value = 'preview'
  } catch (e) {
    error.value = e.status === 429
      ? 'AI rate limit reached. Wait a moment and try again, or switch to a different model in Settings.'
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
    const data = await csvService.import(rows.value)
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
.csv-importer {
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

.amount--positive {
  color: oklch(0.55 0.15 145);
}

.amount--negative {
  color: var(--error);
}

.preview-more {
  padding: 0.6rem 1rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  margin: 0;
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
