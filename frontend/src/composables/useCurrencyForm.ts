import { ref } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSavedFeedback } from './useSavedFeedback'

export function useCurrencyForm() {
  const prefsStore = usePreferencesStore()
  const currencyForm = ref('EUR')
  const languageForm = ref('en')
  const allowDateEditForm = ref(false)
  const saving = ref(false)
  const { saved: currencySaved, markSaved } = useSavedFeedback()

  function currentPrefs() {
    return { currency: currencyForm.value, language: languageForm.value, allow_date_edit: allowDateEditForm.value }
  }

  async function init() {
    await prefsStore.fetch()
    currencyForm.value = prefsStore.currency
    languageForm.value = prefsStore.language
    allowDateEditForm.value = prefsStore.allowDateEdit
  }

  async function saveCurrencyOnChange(currency: string) {
    currencyForm.value = currency
    await prefsStore.save(currentPrefs())
  }

  async function saveLanguage(lang: string) {
    languageForm.value = lang
    await prefsStore.save(currentPrefs())
  }

  async function saveAllowDateEdit(val: boolean) {
    allowDateEditForm.value = val
    await prefsStore.save(currentPrefs())
  }

  return {
    currencyForm,
    languageForm,
    allowDateEditForm,
    init,
    saveCurrencyOnChange,
    saveLanguage,
    saveAllowDateEdit,
  }
}
