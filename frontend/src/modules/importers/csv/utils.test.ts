import { describe, it, expect } from 'vitest'
import { parseDate, parseAmount } from './utils'

// ── parseDate ─────────────────────────────────────────────────────────────────

describe('parseDate', () => {
  describe('YYYY-MM-DD', () => {
    it('parses a valid date', () => {
      expect(parseDate('2024-03-15', 'YYYY-MM-DD')).toBe('2024-03-15')
    })

    it('pads single-digit month and day', () => {
      expect(parseDate('2024-3-5', 'YYYY-MM-DD')).toBe('2024-03-05')
    })

    it('trims surrounding whitespace', () => {
      expect(parseDate('  2024-03-15  ', 'YYYY-MM-DD')).toBe('2024-03-15')
    })
  })

  describe('DD/MM/YYYY', () => {
    it('parses a valid date', () => {
      expect(parseDate('15/03/2024', 'DD/MM/YYYY')).toBe('2024-03-15')
    })

    it('pads single-digit day and month', () => {
      expect(parseDate('5/3/2024', 'DD/MM/YYYY')).toBe('2024-03-05')
    })
  })

  describe('MM/DD/YYYY', () => {
    it('parses a valid date', () => {
      expect(parseDate('03/15/2024', 'MM/DD/YYYY')).toBe('2024-03-15')
    })

    it('does not confuse month and day', () => {
      expect(parseDate('12/01/2024', 'MM/DD/YYYY')).toBe('2024-12-01')
      expect(parseDate('01/12/2024', 'DD/MM/YYYY')).toBe('2024-12-01')
    })
  })

  describe('DD-MM-YYYY', () => {
    it('parses a valid date', () => {
      expect(parseDate('15-03-2024', 'DD-MM-YYYY')).toBe('2024-03-15')
    })
  })

  describe('MM-DD-YYYY', () => {
    it('parses a valid date', () => {
      expect(parseDate('03-15-2024', 'MM-DD-YYYY')).toBe('2024-03-15')
    })
  })

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      expect(parseDate('', 'YYYY-MM-DD')).toBeNull()
    })

    it('returns null for non-numeric content', () => {
      expect(parseDate('not-a-date', 'YYYY-MM-DD')).toBeNull()
    })

    it('returns null for unknown format', () => {
      expect(parseDate('2024-03-15', 'UNKNOWN')).toBeNull()
    })

    it('returns null when parts are missing', () => {
      expect(parseDate('2024-03', 'YYYY-MM-DD')).toBeNull()
    })
  })
})

// ── parseAmount ───────────────────────────────────────────────────────────────

describe('parseAmount', () => {
  describe('dot format (period as decimal)', () => {
    it('parses a positive integer', () => {
      expect(parseAmount('100', 'dot')).toBe(100)
    })

    it('parses a positive decimal', () => {
      expect(parseAmount('1234.56', 'dot')).toBe(1234.56)
    })

    it('strips thousands commas', () => {
      expect(parseAmount('1,234.56', 'dot')).toBe(1234.56)
    })

    it('parses a negative value with minus sign', () => {
      expect(parseAmount('-45.30', 'dot')).toBe(-45.3)
    })

    it('parses a negative value in parentheses', () => {
      expect(parseAmount('(45.30)', 'dot')).toBe(-45.3)
    })

    it('strips whitespace', () => {
      expect(parseAmount('  99.99  ', 'dot')).toBe(99.99)
    })
  })

  describe('comma format (comma as decimal)', () => {
    it('parses a positive decimal', () => {
      expect(parseAmount('1234,56', 'comma')).toBe(1234.56)
    })

    it('strips thousands dots', () => {
      expect(parseAmount('1.234,56', 'comma')).toBe(1234.56)
    })

    it('parses a negative value with minus sign', () => {
      expect(parseAmount('-1.234,56', 'comma')).toBe(-1234.56)
    })

    it('parses a negative value in parentheses', () => {
      expect(parseAmount('(1.234,56)', 'comma')).toBe(-1234.56)
    })
  })

  describe('invalid input', () => {
    it('returns null for empty string', () => {
      expect(parseAmount('', 'dot')).toBeNull()
    })

    it('returns null for non-numeric string', () => {
      expect(parseAmount('abc', 'dot')).toBeNull()
    })

    it('returns null for currency symbol alone', () => {
      expect(parseAmount('€', 'dot')).toBeNull()
    })
  })
})
