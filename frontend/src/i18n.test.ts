import { describe, it, expect, beforeEach, vi } from 'vitest'

const STORAGE_KEY = 'finity_lang'

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  // ── resolveInitialLocale ───────────────────────────────────────────────────

  describe('initial locale resolution', () => {
    it('uses the locale stored in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, 'es')
      const { i18n } = await import('./i18n')
      expect(i18n.global.locale.value).toBe('es')
    })

    it('falls back to browser language when localStorage is empty', async () => {
      Object.defineProperty(navigator, 'language', { value: 'it-IT', configurable: true })
      const { i18n } = await import('./i18n')
      expect(i18n.global.locale.value).toBe('it')
    })

    it('falls back to en when browser language is not supported', async () => {
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true })
      const { i18n } = await import('./i18n')
      expect(i18n.global.locale.value).toBe('en')
    })

    it('prefers localStorage over browser language', async () => {
      localStorage.setItem(STORAGE_KEY, 'es')
      Object.defineProperty(navigator, 'language', { value: 'it-IT', configurable: true })
      const { i18n } = await import('./i18n')
      expect(i18n.global.locale.value).toBe('es')
    })

    it('ignores unsupported values in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, 'fr')
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true })
      const { i18n } = await import('./i18n')
      expect(i18n.global.locale.value).toBe('en')
    })
  })

  // ── setLocale ──────────────────────────────────────────────────────────────

  describe('setLocale', () => {
    it('updates i18n locale', async () => {
      const { i18n, setLocale } = await import('./i18n')
      setLocale('es')
      expect(i18n.global.locale.value).toBe('es')
    })

    it('persists the language to localStorage', async () => {
      const { setLocale } = await import('./i18n')
      setLocale('it')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('it')
    })

    it('switching language is reflected immediately', async () => {
      const { i18n, setLocale } = await import('./i18n')
      setLocale('es')
      expect(i18n.global.locale.value).toBe('es')
      setLocale('en')
      expect(i18n.global.locale.value).toBe('en')
    })
  })
})
