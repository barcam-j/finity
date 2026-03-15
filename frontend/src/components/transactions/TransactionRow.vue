<template>
  <tr :class="{ 'row--selected': selected }">
    <td class="col-select" @click.stop>
      <input type="checkbox" :checked="selected" @change="emit('toggle-select', tx.id!)" />
    </td>

    <td class="col-date" @click.stop="startEdit('date')">
      <input
        v-if="editingField === 'date'"
        v-autofocus
        v-model="draft.date"
        type="date"
        class="cell-input"
        @blur="save('date')"
        @keydown.enter.prevent="save('date')"
        @keydown.esc.prevent="cancel"
      />
      <span v-else>{{ tx.date }}</span>
    </td>

    <td @click.stop="startEdit('description')">
      <input
        v-if="editingField === 'description'"
        v-autofocus
        v-model="draft.description"
        type="text"
        class="cell-input"
        @blur="save('description')"
        @keydown.enter.prevent="save('description')"
        @keydown.esc.prevent="cancel"
      />
      <span v-else>{{ tx.description || '—' }}</span>
    </td>

    <td @click.stop="startEdit('categories')">
      <template v-if="editingField === 'categories'">
        <div class="tags-editor" @click.stop>
          <span v-for="cat in draft.categories" :key="cat" class="tag-chip">
            {{ cat }}
            <button class="tag-remove" @mousedown.prevent @click.stop="removeCategory(cat)">×</button>
          </span>
          <input
            v-autofocus
            v-model="categoryInput"
            type="text"
            :list="`cats-${tx.id}`"
            class="tag-input"
            placeholder="Add…"
            @keydown.enter.prevent="addCategory"
            @blur="addCategoryAndSave"
            @keydown.esc.prevent="cancel"
          />
        </div>
        <datalist :id="`cats-${tx.id}`">
          <option v-for="cat in availableCats" :key="cat" :value="cat" />
        </datalist>
      </template>
      <template v-else>
        <div class="badges-row">
          <span v-for="cat in tx.categories" :key="cat" class="badge badge--removable">
            {{ cat }}
            <button class="badge-remove" @click.stop="removeAndSave(cat)">×</button>
          </span>
          <span v-if="!tx.categories.length" class="text-muted">—</span>
        </div>
      </template>
    </td>

    <td
      class="col-amount"
      :class="tx.amount < 0 ? 'amount--negative' : 'amount--positive'"
    >
      <span>{{ formatAmount(tx.amount) }}</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { Transaction } from '@/types'
import { useCurrency } from '@/composables/useCurrency'

type EditableField = 'date' | 'description' | 'categories'

const props = defineProps<{
  tx: Transaction
  selected: boolean
  categories: string[]
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  update: [id: string, field: EditableField, value: string | string[]]
}>()

const { formatAmount } = useCurrency()

const editingField = ref<EditableField | null>(null)
const draft = reactive({ date: '', description: '', categories: [] as string[] })
const categoryInput = ref('')

const vAutofocus = { mounted: (el: HTMLElement) => el.focus() }

const availableCats = computed(() =>
  props.categories.filter((c) => !draft.categories.includes(c)),
)

function startEdit(field: EditableField): void {
  draft.date = props.tx.date
  draft.description = props.tx.description || ''
  draft.categories = [...(props.tx.categories || [])]
  categoryInput.value = ''
  editingField.value = field
}

function addCategory(): void {
  const val = categoryInput.value.trim()
  if (val && !draft.categories.includes(val)) {
    draft.categories.push(val)
  }
  categoryInput.value = ''
}

function removeCategory(cat: string): void {
  draft.categories = draft.categories.filter((c) => c !== cat)
}

function removeAndSave(cat: string): void {
  const updated = (props.tx.categories || []).filter((c) => c !== cat)
  emit('update', props.tx.id!, 'categories', updated)
}

function addCategoryAndSave(): void {
  addCategory()
  save('categories')
}

function save(field: EditableField): void {
  editingField.value = null
  if (field === 'categories') {
    const original = JSON.stringify([...(props.tx.categories || [])].sort())
    const updated = JSON.stringify([...draft.categories].sort())
    if (original !== updated) emit('update', props.tx.id!, 'categories', draft.categories)
    return
  }
  const value = draft[field]
  if (value !== props.tx[field]) emit('update', props.tx.id!, field, value)
}

function cancel(): void {
  editingField.value = null
}
</script>

<style scoped>
td {
  padding: 0.7rem 1.5rem;
  border-top: 1px solid var(--border);
  color: var(--text);
}

.row--selected td {
  background: var(--accent-subtle, oklch(0.97 0.03 42));
}

.col-select {
  width: 2.5rem;
  text-align: center;
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

.amount--positive { color: oklch(0.55 0.15 145); }
.amount--negative { color: var(--error); }

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.badge-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
  color: var(--text-muted);
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width 0.2s ease, opacity 0.2s ease;
}

.badge-remove:hover { color: var(--error); }

.badge--removable:hover .badge-remove {
  max-width: 1rem;
  opacity: 1;
}

.text-muted { color: var(--text-muted); }

.tags-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.8rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.4rem;
  background: var(--accent-subtle, oklch(0.97 0.03 42));
  border: 1px solid var(--accent);
  border-radius: 99px;
  font-size: 0.78rem;
  color: var(--text);
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
  color: var(--text-muted);
}

.tag-remove:hover { color: var(--error); }

.tag-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text);
  min-width: 5rem;
  width: 5rem;
  font-family: inherit;
}

.cell-input {
  width: 100%;
  min-width: 6rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--accent);
  border-radius: 4px;
  background: var(--card-bg);
  color: var(--text);
  font-size: inherit;
  font-family: inherit;
  outline: none;
}
</style>
