import { ref, computed } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSavedFeedback } from './useSavedFeedback'

export function useCurrencyForm() {
  const prefsStore = usePreferencesStore()
  const currencyForm = ref('EUR')
  const saving = ref(false)
  const { saved: currencySaved, markSaved } = useSavedFeedback()

  async function init() {
    await prefsStore.fetch()
    currencyForm.value = prefsStore.currency
  }

  async function saveCurrency() {
    saving.value = true
    try {
      await prefsStore.save({ currency: currencyForm.value })
      markSaved()
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    currencyForm,
    currencySaved,
    init,
    saveCurrency,
  }
}
