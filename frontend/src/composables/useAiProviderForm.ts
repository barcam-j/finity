import { ref, computed } from 'vue'
import { useAiStore } from '@/stores/ai'
import { aiConfigService } from '@/services/ai-config'
import { useSavedFeedback } from './useSavedFeedback'

export function useAiProviderForm() {
  const aiStore = useAiStore()
  const { saved, markSaved } = useSavedFeedback()

  const form = ref({ provider: 'gemini', model: '', apiKey: '' })
  const currentModels = ref<string[]>([])
  const modelsLoading = ref(false)

  const hasExistingConfig = computed(() => !!aiStore.config)
  const canSave = computed(
    () =>
      form.value.provider && form.value.model && (form.value.apiKey || hasExistingConfig.value),
  )

  async function init(): Promise<void> {
    await aiStore.fetchConfig()
    if (aiStore.config) {
      form.value.provider = aiStore.config.provider
      form.value.model = aiStore.config.model
    }
    await onProviderChange()
  }

  async function onProviderChange(): Promise<void> {
    modelsLoading.value = true
    form.value.model = ''
    try {
      currentModels.value = await aiConfigService.models(form.value.provider)
      if (currentModels.value.length) form.value.model = currentModels.value[0]
    } finally {
      modelsLoading.value = false
    }
  }

  async function save(): Promise<void> {
    const payload = {
      provider: form.value.provider,
      model: form.value.model,
      ...(form.value.apiKey ? { api_key: form.value.apiKey } : {}),
    }
    try {
      await aiStore.saveConfig(payload)
      form.value.apiKey = ''
      markSaved()
    } catch {
      // error exposed via aiStore.error
    }
  }

  const loading = computed(() => aiStore.loading)
  const error = computed(() => aiStore.error)

  return {
    loading,
    error,
    form,
    currentModels,
    modelsLoading,
    hasExistingConfig,
    canSave,
    saved,
    init,
    onProviderChange,
    save,
  }
}
