<template>
  <Transition
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
  <div v-if="count > 0" class="bulk-bar">
    <span class="bulk-count">{{ t('transactions.selected', { count }) }}</span>

    <div class="bulk-actions">
      <div class="bulk-category">
        <input
          v-model="categoryInput"
          type="text"
          :list="'bulk-cats'"
          class="bulk-input"
          :placeholder="t('transactions.setCategoryPlaceholder')"
        />
        <datalist id="bulk-cats">
          <option v-for="cat in categories" :key="cat" :value="cat" />
        </datalist>
        <button class="btn-apply" :title="t('transactions.applyCategory')" @click="applyCategory">
          <Check :size="15" />
        </button>
      </div>

      <button class="btn-danger" :title="t('transactions.deleteSelected')" @click="emit('delete-selected')">
        <Trash2 :size="15" />
      </button>
      <button class="btn-clear" @click="emit('clear-selection')">✕</button>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Trash2 } from 'lucide-vue-next'

const { t } = useI18n()

function onEnter(el: Element): void {
  const div = el as HTMLElement
  div.style.overflow = 'hidden'
  div.style.height = '0'
  div.style.opacity = '0'
  div.offsetHeight
  div.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  div.style.height = div.scrollHeight + 'px'
  div.style.opacity = '1'
}

function onAfterEnter(el: Element): void {
  const div = el as HTMLElement
  div.style.height = 'auto'
  div.style.overflow = ''
  div.style.transition = ''
}

function onLeave(el: Element, done: () => void): void {
  const div = el as HTMLElement
  div.style.overflow = 'hidden'
  div.style.height = div.scrollHeight + 'px'
  div.offsetHeight
  div.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  div.style.height = '0'
  div.style.opacity = '0'
  div.addEventListener('transitionend', done, { once: true })
}

const emit = defineEmits<{
  'apply-category': [category: string]
  'delete-selected': []
  'clear-selection': []
}>()

const categoryInput = ref('')

const props = defineProps<{
  count: number
  categories: string[]
}>()

function catKey(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')
}

function applyCategory(): void {
  const raw = categoryInput.value.trim()
  if (!raw) return
  const key = catKey(raw)
  const normalized = props.categories.find((c) => catKey(c) === key) ?? raw
  emit('apply-category', normalized)
  categoryInput.value = ''
}
</script>

<style scoped>
.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--accent);
  border-radius: 10px;
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.08);
}

.bulk-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.bulk-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.bulk-input {
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 0.875rem;
  width: 11rem;
  outline: none;
  transition: border-color 0.15s;
  text-transform: capitalize;
}

.bulk-input:focus {
  border-color: var(--accent);
}

.btn-apply {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-apply:hover { opacity: 0.85; }

.btn-danger {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  background: none;
  color: var(--error);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-danger:hover {
  background: oklch(0.97 0.02 20);
}

.btn-clear {
  padding: 0.3rem 0.5rem;
  background: none;
  color: var(--text-muted);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-clear:hover { color: var(--text); }
</style>
