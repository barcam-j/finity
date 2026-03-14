import { defineStore } from 'pinia'
import { ref } from 'vue'
import { preferencesService } from '@/services/preferences'
import type { UserPreferences } from '@/types'

export const usePreferencesStore = defineStore('preferences', () => {
  const currency = ref('EUR')
  const loading = ref(false)

  async function fetch(): Promise<void> {
    loading.value = true
    try {
      const data = await preferencesService.get()
      currency.value = data.currency
    } finally {
      loading.value = false
    }
  }

  async function save(data: UserPreferences): Promise<void> {
    loading.value = true
    try {
      const result = await preferencesService.save(data)
      currency.value = result.currency
    } finally {
      loading.value = false
    }
  }

  return { currency, loading, fetch, save }
})
