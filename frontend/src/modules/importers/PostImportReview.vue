<template>
  <div class="review">
    <div class="review__header">
      <div>
        <h3>{{ t('importer.reviewTitle') }}</h3>
        <p class="review__subtitle">{{ t('importer.reviewSubtitle', { count: pending.length }) }}</p>
      </div>
      <button class="btn-secondary" @click="emit('done')">{{ t('importer.reviewSkip') }}</button>
    </div>

    <div v-if="pending.length" class="review-table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="col-date">{{ t('importer.date') }}</th>
            <th>{{ t('importer.description') }}</th>
            <th class="col-amount">{{ t('importer.amount') }}</th>
            <th class="col-category">{{ t('importer.category') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in pending" :key="tx.id" :class="{ 'row--saving': saving === tx.id, 'row--saved': saved[tx.id!] }">
            <td class="col-date">{{ tx.date }}</td>
            <td class="col-desc">{{ tx.description || '—' }}</td>
            <td class="col-amount" :class="tx.amount < 0 ? 'amount--negative' : 'amount--positive'">
              {{ formatAmount(tx.amount) }}
            </td>
            <td class="col-category">
              <div v-if="saved[tx.id!]" class="saved-feedback">
                <span class="badge">{{ saved[tx.id!].category }}</span>
                <span v-if="saved[tx.id!].ruleCreated" class="rule-hint">{{ t('importer.reviewRuleCreated') }}</span>
              </div>
              <template v-else>
                <div class="category-input-wrap">
                  <input
                    v-model="inputs[tx.id!]"
                    type="text"
                    list="categories-list"
                    :placeholder="t('importer.reviewCategoryPlaceholder')"
                    :disabled="saving === tx.id"
                    @keydown.enter.prevent="save(tx.id!)"
                  />
                  <button
                    class="btn-confirm"
                    :disabled="!inputs[tx.id!]?.trim() || saving === tx.id"
                    @click="save(tx.id!)"
                  >✓</button>
                </div>
                <label class="rule-checkbox">
                  <input type="checkbox" v-model="saveRules[tx.id!]" />
                  {{ t('importer.reviewSaveRule') }}
                </label>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <datalist id="categories-list">
      <option v-for="c in categories" :key="c" :value="c" />
    </datalist>

    <div v-if="!pending.length && !Object.keys(saved).length" class="all-done">
      <p>{{ t('importer.reviewAllDone') }}</p>
    </div>

    <div class="review__footer">
      <button class="btn-primary" @click="emit('done')">{{ t('importer.reviewFinish') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import type { Transaction } from '@/types'

const props = defineProps<{ transactions: Transaction[] }>()
const emit = defineEmits<{ done: [] }>()

const { t } = useI18n()
const { formatAmount } = useCurrency()

const pending = ref<Transaction[]>(props.transactions.filter(tx => !tx.categories?.length))
const inputs = reactive<Record<string, string>>(
  Object.fromEntries(pending.value.map(tx => [tx.id!, '']))
)
const saveRules = reactive<Record<string, boolean>>(
  Object.fromEntries(pending.value.map(tx => [tx.id!, true]))
)
const saving = ref<string | null>(null)
const saved = reactive<Record<string, { category: string; ruleCreated: boolean }>>({})
const categories = ref<string[]>([])

onMounted(async () => {
  try {
    const data = await api.get<{ categories: string[] }>('/transactions/categories')
    categories.value = data.categories ?? []
  } catch {
    // datalist is optional — ignore errors
  }
})

async function save(id: string) {
  const category = inputs[id]?.trim()
  if (!category) return
  saving.value = id
  const createRule = saveRules[id] ?? true
  try {
    await api.patch(`/transactions/${id}`, { categories: [category], save_rule: createRule })
    saved[id] = { category, ruleCreated: createRule }
    setTimeout(() => {
      pending.value = pending.value.filter(tx => tx.id !== id)
      delete saved[id]
    }, 1800)
  } catch {
    // leave row in list so user can retry
  } finally {
    saving.value = null
  }
}
</script>

<style scoped>
.review__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.review__header h3 {
  margin: 0 0 0.25rem;
}

.review__subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.review-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
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
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--border);
  color: var(--text);
}

tr.row--saving { opacity: 0.5; }
tr.row--saved { background: var(--accent-subtle); transition: background 0.3s; }

.col-date {
  white-space: nowrap;
  color: var(--text-muted);
  font-size: 0.85rem;
  width: 7rem;
}

.col-desc {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  width: 8rem;
}

.col-category {
  width: 260px;
}

.amount--positive { color: oklch(0.55 0.15 145); }
.amount--negative { color: var(--error); }

.category-input-wrap {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.category-input-wrap input {
  flex: 1;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.875rem;
  min-width: 0;
}

.category-input-wrap input:focus {
  outline: none;
  border-color: var(--accent);
}

.category-input-wrap input:disabled { opacity: 0.5; }

.btn-confirm {
  flex-shrink: 0;
  width: 1.8rem;
  height: 1.8rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm:hover:not(:disabled) { background: var(--btn-hover); }
.btn-confirm:disabled { opacity: 0.35; cursor: not-allowed; }

.rule-checkbox {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}

.rule-checkbox input[type='checkbox'] {
  cursor: pointer;
  accent-color: var(--accent);
}

.saved-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rule-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  border-radius: 99px;
  font-size: 0.78rem;
  color: var(--accent);
  font-weight: 500;
}

.all-done {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.review__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

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

.btn-primary:hover { background: var(--btn-hover); }

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
</style>
