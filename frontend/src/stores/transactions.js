import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionsService } from '@/services/transactions'

export const useTransactionsStore = defineStore('transactions', () => {
  const items = ref([])
  const total = ref(0)
  const page = ref(1)
  const pages = ref(1)
  const loading = ref(false)
  const error = ref(null)

  async function fetch(p = 1) {
    loading.value = true
    error.value = null
    try {
      const data = await transactionsService.getAll({ page: p, limit: 20 })
      items.value = data.items
      total.value = data.total
      page.value = data.page
      pages.value = data.pages
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    await transactionsService.delete(id)
    await fetch(page.value)
  }

  return { items, total, page, pages, loading, error, fetch, remove }
})
