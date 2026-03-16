import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionsService } from '@/services/transactions'
import type { Transaction, TransactionFilters } from '@/types'

export const useTransactionsStore = defineStore('transactions', () => {
  const items = ref<Transaction[]>([])
  const categories = ref<string[]>([])
  const total = ref(0)
  const page = ref(1)
  const pages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch(p = 1, filters: TransactionFilters = {}): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await transactionsService.getAll({ page: p, limit: 20, ...filters })
      items.value = data.items
      total.value = data.total
      page.value = data.page
      pages.value = data.pages
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories(): Promise<void> {
    try {
      categories.value = await transactionsService.getCategories()
    } catch { /* non-blocking */ }
  }

  async function updateTransaction(id: string, data: Partial<Transaction>): Promise<number> {
    const result = await transactionsService.update(id, data)
    const idx = items.value.findIndex((t) => t.id === id)
    if (idx !== -1) items.value[idx] = result.transaction
    if ('categories' in data) {
      await fetchCategories()
      if (result.auto_categorized > 0) {
        await fetch(page.value)
      }
    }
    return result.auto_categorized
  }

  async function bulkUpdateCategory(ids: string[], category: string): Promise<number> {
    const result = await transactionsService.bulkUpdateCategory(ids, category)
    await Promise.all([fetch(page.value), fetchCategories()])
    return result.auto_categorized ?? 0
  }

  async function remove(id: string): Promise<void> {
    await transactionsService.delete(id)
    await fetch(page.value)
  }

  async function bulkRemove(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => transactionsService.delete(id)))
    await fetch(page.value)
  }

  async function deduplicate(): Promise<number> {
    const result = await transactionsService.deduplicate()
    await Promise.all([fetch(1), fetchCategories()])
    return result.deleted
  }

  return {
    items, categories, total, page, pages, loading, error,
    fetch, fetchCategories, updateTransaction, bulkUpdateCategory, remove, bulkRemove, deduplicate,
  }
})
