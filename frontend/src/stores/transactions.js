import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  return { transactions, loading, error }
})
