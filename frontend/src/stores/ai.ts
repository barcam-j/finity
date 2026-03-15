import { defineStore } from 'pinia'
import { ref } from 'vue'
import { aiConfigService } from '@/services/ai-config'
import type { AiConfig, SaveAiConfigRequest } from '@/types'

export const useAiStore = defineStore('ai', () => {
  const config = ref<AiConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchConfig(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      config.value = await aiConfigService.get()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function saveConfig(data: SaveAiConfigRequest): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await aiConfigService.save(data)
      await fetchConfig()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { config, loading, error, fetchConfig, saveConfig }
})
