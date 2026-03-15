import { ref, computed, watch } from 'vue'
import { useAiStore } from '@/stores/ai'
import { aiConfigService } from '@/services/ai-config'
import { useSavedFeedback } from './useSavedFeedback'

export function useAiProviderForm() {
  const aiStore = useAiStore()
  const { saved, markSaved } = useSavedFeedback()

  const form = ref({ provider: 'gemini', model: '', apiKey: '', analysisEnabled: false })
  const currentModels = ref<string[]>([])
  const modelsLoading = ref(false)
  const initializing = ref(true)

  const hasExistingConfig = computed(() => !!aiStore.config)
  const canSave = computed(
    () =>
      form.value.provider && form.value.model && (form.value.apiKey || hasExistingConfig.value),
  )

  async function init(): Promise<void> {
    try {
      await aiStore.fetchConfig()
      if (aiStore.config) {
        form.value.provider = aiStore.config.provider
        form.value.analysisEnabled = aiStore.config.analysis_enabled
        const savedModel = aiStore.config.model
        await onProviderChange()
        // Restore saved model after onProviderChange resets it
        if (savedModel) form.value.model = savedModel
      } else {
        await onProviderChange()
      }
    } finally {
      initializing.value = false
    }
  }

  async function onProviderChange(): Promise<void> {
    if (!form.value.provider) {
      currentModels.value = []
      form.value.model = ''
      return
    }
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
      analysis_enabled: form.value.analysisEnabled,
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

  watch(
    () => form.value.apiKey,
    (key) => { if (key) form.value.analysisEnabled = true },
  )

  const togglingAnalysis = ref(false)

  async function toggleAnalysis(): Promise<void> {
    if (!hasExistingConfig.value) {
      form.value.analysisEnabled = !form.value.analysisEnabled
      return
    }
    const next = !form.value.analysisEnabled
    togglingAnalysis.value = true
    try {
      await aiConfigService.setAnalysisEnabled(next)
      form.value.analysisEnabled = next
      if (aiStore.config) aiStore.config.analysis_enabled = next
    } finally {
      togglingAnalysis.value = false
    }
  }

  const loading = computed(() => aiStore.loading)
  const error = computed(() => aiStore.error)

  return {
    loading,
    error,
    initializing,
    togglingAnalysis,
    form,
    currentModels,
    modelsLoading,
    hasExistingConfig,
    canSave,
    saved,
    init,
    onProviderChange,
    save,
    toggleAnalysis,
  }
}
