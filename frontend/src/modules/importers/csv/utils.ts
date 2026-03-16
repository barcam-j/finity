export function parseDate(raw: string, format: string): string | null {
  const s = raw.trim()
  let day: number, month: number, year: number

  if (format === 'YYYY-MM-DD') {
    ;[year, month, day] = s.split('-').map(Number)
  } else if (format === 'DD/MM/YYYY') {
    ;[day, month, year] = s.split('/').map(Number)
  } else if (format === 'MM/DD/YYYY') {
    ;[month, day, year] = s.split('/').map(Number)
  } else if (format === 'DD-MM-YYYY') {
    ;[day, month, year] = s.split('-').map(Number)
  } else if (format === 'MM-DD-YYYY') {
    ;[month, day, year] = s.split('-').map(Number)
  } else {
    return null
  }

  if (!day || !month || !year) return null
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function parseAmount(raw: string, format: string): number | null {
  let s = raw.trim().replace(/\s/g, '')
  const negative = s.startsWith('-') || (s.startsWith('(') && s.endsWith(')'))
  s = s.replace(/^-/, '').replace(/^\(/, '').replace(/\)$/, '')

  if (format === 'comma') {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    s = s.replace(/,/g, '')
  }

  const n = parseFloat(s)
  if (isNaN(n)) return null
  return negative ? -Math.abs(n) : n
}
