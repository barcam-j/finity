import { usePreferencesStore } from '@/stores/preferences'
import { i18n } from '@/i18n'

export function useCurrency() {
  const prefs = usePreferencesStore()

  function formatAmount(amount: number, decimals = 2): string {
    const parts = new Intl.NumberFormat(i18n.global.locale.value, {
      style: 'currency',
      currency: prefs.currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).formatToParts(amount)

    const symbol = parts.find((p) => p.type === 'currency')?.value ?? prefs.currency
    const number = parts
      .filter((p) => p.type !== 'currency')
      .map((p) => p.value)
      .join('')
      .trim()

    return `${number} ${symbol}`
  }

  return { formatAmount }
}
