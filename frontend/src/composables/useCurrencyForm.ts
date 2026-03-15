import { ref, computed } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSavedFeedback } from './useSavedFeedback'

export function useCurrencyForm() {
  const prefsStore = usePreferencesStore()
  const currencyForm = ref('EUR')
  const { saved: currencySaved, markSaved } = useSavedFeedback()

  const loading = computed(() => prefsStore.loading)

  async function init() {
    await prefsStore.fetch()
    currencyForm.value = prefsStore.currency
  }

  async function saveCurrency() {
    await prefsStore.save({ currency: currencyForm.value })
    markSaved()
  }

  return {
    loading,
    currencyForm,
    currencySaved,
    init,
    saveCurrency,
  }
}
