import { ref } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSavedFeedback } from './useSavedFeedback'

export function useCurrencyForm() {
  const prefsStore = usePreferencesStore()
  const currencyForm = ref('EUR')
  const languageForm = ref('en')
  const saving = ref(false)
  const { saved: currencySaved, markSaved } = useSavedFeedback()

  async function init() {
    await prefsStore.fetch()
    currencyForm.value = prefsStore.currency
    languageForm.value = prefsStore.language
  }

  async function saveCurrency() {
    saving.value = true
    try {
      await prefsStore.save({ currency: currencyForm.value, language: languageForm.value })
      markSaved()
    } finally {
      saving.value = false
    }
  }

  async function saveCurrencyOnChange(currency: string) {
    currencyForm.value = currency
    await prefsStore.save({ currency, language: languageForm.value })
  }

  async function saveLanguage(lang: string) {
    languageForm.value = lang
    await prefsStore.save({ currency: currencyForm.value, language: lang })
  }

  return {
    currencyForm,
    languageForm,
    init,
    saveCurrencyOnChange,
    saveLanguage,
  }
}
