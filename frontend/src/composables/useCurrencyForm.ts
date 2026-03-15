import { ref } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSavedFeedback } from './useSavedFeedback'

export function useCurrencyForm() {
  const prefsStore = usePreferencesStore()
  const currencyForm = ref('EUR')
  const { saved: currencySaved, markSaved } = useSavedFeedback()

  function init(currency: string) {
    currencyForm.value = currency
  }

  async function saveCurrency() {
    await prefsStore.save({ currency: currencyForm.value })
    markSaved()
  }

  return {
    prefsStore,
    currencyForm,
    currencySaved,
    init,
    saveCurrency,
  }
}
