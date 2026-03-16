import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCurrency } from './useCurrency'
import { usePreferencesStore } from '@/stores/preferences'

// preferencesService and setLocale make network/localStorage calls we don't need here
vi.mock('@/services/preferences')
vi.mock('@/i18n', () => ({ setLocale: vi.fn() }))

function setup(currency: string) {
  setActivePinia(createPinia())
  const store = usePreferencesStore()
  store.currency = currency
  return useCurrency()
}

describe('formatAmount', () => {
  describe('symbol position', () => {
    it('always places the currency symbol after the number', () => {
      const { formatAmount } = setup('EUR')
      const result = formatAmount(42.5)
      // Number part must come before the symbol
      const symbolIndex = result.lastIndexOf('€')
      const numberIndex = result.search(/\d/)
      expect(symbolIndex).toBeGreaterThan(numberIndex)
    })
  })

  describe('EUR', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('formats a positive amount', () => {
      const { formatAmount } = setup('EUR')
      expect(formatAmount(1234.56)).toContain('1,234.56')
      expect(formatAmount(1234.56)).toContain('€')
    })

    it('formats a negative amount', () => {
      const { formatAmount } = setup('EUR')
      const result = formatAmount(-45.3)
      expect(result).toContain('45.30')
      expect(result).toContain('€')
      expect(result).toMatch(/-/)
    })

    it('formats zero', () => {
      const { formatAmount } = setup('EUR')
      expect(formatAmount(0)).toContain('0.00')
    })
  })

  describe('GBP', () => {
    it('formats with pound symbol', () => {
      const { formatAmount } = setup('GBP')
      const result = formatAmount(100)
      expect(result).toContain('£')
      expect(result).toContain('100.00')
    })
  })

  describe('JPY', () => {
    it('formats without decimal places', () => {
      const { formatAmount } = setup('JPY')
      const result = formatAmount(1000)
      // JPY has no minor units — no decimal point expected
      expect(result).not.toContain('.')
      expect(result).toContain('1,000')
    })
  })
})
