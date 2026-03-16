import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'
import it from './locales/it.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, es, it },
})

export function setLocale(lang: string): void {
  i18n.global.locale.value = lang as 'en' | 'es' | 'it'
}
