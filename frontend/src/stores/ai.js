import { defineStore } from 'pinia'
import { ref } from 'vue'
import { aiConfigService } from '@/services/ai-config'

export const useAiStore = defineStore('ai', () => {
  const config = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchConfig() {
    loading.value = true
    error.value = null
    try {
      config.value = await aiConfigService.get()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(data) {
    loading.value = true
    error.value = null
    try {
      await aiConfigService.save(data)
      config.value = { provider: data.provider, model: data.model, params: data.params ?? {} }
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { config, loading, error, fetchConfig, saveConfig }
})
