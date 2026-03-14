import { usePreferencesStore } from '@/stores/preferences'

export function useCurrency() {
  const prefs = usePreferencesStore()

  function formatAmount(amount) {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: prefs.currency,
      currencyDisplay: 'symbol',
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
