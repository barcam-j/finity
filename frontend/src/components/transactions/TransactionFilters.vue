<template>
  <div class="filters-bar">
    <div class="filter-search">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="search"
        type="text"
        class="filter-input"
        placeholder="Search description…"
        @input="scheduleEmit"
      />
    </div>

    <div ref="catDropdownEl" class="filter-dropdown">
      <button class="filter-btn" :class="{ active: selectedCategories.length }" @click.stop="catOpen = !catOpen">
        {{ selectedCategories.length ? `Categories (${selectedCategories.length})` : 'Categories' }}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div v-if="catOpen" class="dropdown-menu">
        <label v-for="cat in categories" :key="cat" class="dropdown-item">
          <input type="checkbox" :value="cat" v-model="selectedCategories" @change="scheduleEmit" />
          <span>{{ cat }}</span>
        </label>
        <p v-if="!categories.length" class="dropdown-empty">No categories yet</p>
      </div>
    </div>

    <div class="filter-dates">
      <input v-model="dateFrom" type="date" class="filter-input filter-input--date" title="From date" @change="scheduleEmit" />
      <span class="date-sep">—</span>
      <input v-model="dateTo" type="date" class="filter-input filter-input--date" title="To date" @change="scheduleEmit" />
    </div>

    <div class="filter-amounts">
      <input v-model.number="amountMin" type="number" step="0.01" class="filter-input filter-input--amount" placeholder="Min amount" @input="scheduleEmit" />
      <span class="date-sep">—</span>
      <input v-model.number="amountMax" type="number" step="0.01" class="filter-input filter-input--amount" placeholder="Max amount" @input="scheduleEmit" />
    </div>

    <button v-if="activeCount > 0" class="btn-clear-filters" @click="clearAll">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      Clear
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TransactionFilters } from '@/types'

const props = defineProps<{
  categories: string[]
}>()

const emit = defineEmits<{
  filter: [filters: TransactionFilters]
}>()

const search = ref('')
const selectedCategories = ref<string[]>([])
const dateFrom = ref('')
const dateTo = ref('')
const amountMin = ref<number | ''>('')
const amountMax = ref<number | ''>('')
const catOpen = ref(false)
const catDropdownEl = ref<HTMLElement | null>(null)

const activeCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (selectedCategories.value.length) count++
  if (dateFrom.value) count++
  if (dateTo.value) count++
  if (amountMin.value !== '') count++
  if (amountMax.value !== '') count++
  return count
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function scheduleEmit(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const filters: TransactionFilters = {}
    if (search.value) filters.search = search.value
    if (selectedCategories.value.length) filters.categories = [...selectedCategories.value]
    if (dateFrom.value) filters.date_from = dateFrom.value
    if (dateTo.value) filters.date_to = dateTo.value
    if (amountMin.value !== '') filters.amount_min = amountMin.value as number
    if (amountMax.value !== '') filters.amount_max = amountMax.value as number
    emit('filter', filters)
  }, 300)
}

function clearAll(): void {
  search.value = ''
  selectedCategories.value = []
  dateFrom.value = ''
  dateTo.value = ''
  amountMin.value = ''
  amountMax.value = ''
  catOpen.value = false
  scheduleEmit()
}

function onDocClick(e: MouseEvent): void {
  if (catDropdownEl.value && !catDropdownEl.value.contains(e.target as Node)) {
    catOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<style scoped>
.filters-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.65rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.filter-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 12rem;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  color: var(--text-muted);
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.filter-search .filter-input {
  padding-left: 2rem;
}

.filter-input:focus {
  border-color: var(--accent);
}

.filter-input--date {
  width: 8.5rem;
}

.filter-input--amount {
  width: 7rem;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}

.filter-btn:hover,
.filter-btn.active {
  border-color: var(--accent);
  color: var(--text);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  z-index: 20;
  min-width: 11rem;
  max-height: 14rem;
  overflow-y: auto;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px oklch(0 0 0 / 0.1);
  padding: 0.35rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  text-transform: capitalize;
  color: var(--text);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item input[type='checkbox'] {
  accent-color: var(--accent);
}

.dropdown-empty {
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.filter-dates,
.filter-amounts {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.date-sep {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.btn-clear-filters:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
</style>
