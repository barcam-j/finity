import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'
import it from './locales/it.json'

const SUPPORTED = ['en', 'es', 'it']
const STORAGE_KEY = 'finity_lang'

function resolveInitialLocale(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && SUPPORTED.includes(stored)) return stored
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, es, it },
})

export function setLocale(lang: string): void {
  i18n.global.locale.value = lang as 'en' | 'es' | 'it'
  localStorage.setItem(STORAGE_KEY, lang)
}
