import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTransactionsStore } from './transactions'
import type { Transaction } from '@/types'

vi.mock('@/services/transactions', () => ({
  transactionsService: {
    getAll: vi.fn(),
    getCategories: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
    bulkUpdateCategory: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

import { transactionsService } from '@/services/transactions'

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'abc',
    date: '2024-01-01',
    amount: -10,
    description: 'Test',
    categories: [],
    ...overrides,
  }
}

describe('useTransactionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── updateTransaction ──────────────────────────────────────────────────────

  describe('updateTransaction', () => {
    it('replaces the correct item in items', async () => {
      const store = useTransactionsStore()
      const original = makeTransaction({ id: '1', description: 'Old' })
      const other = makeTransaction({ id: '2', description: 'Other' })
      store.items = [original, other]

      const updated = makeTransaction({ id: '1', description: 'New' })
      vi.mocked(transactionsService.update).mockResolvedValue(updated)

      await store.updateTransaction('1', { description: 'New' })

      expect(store.items[0].description).toBe('New')
      expect(store.items[1].description).toBe('Other')
    })

    it('does not mutate items when id is not found', async () => {
      const store = useTransactionsStore()
      const tx = makeTransaction({ id: '1' })
      store.items = [tx]

      const updated = makeTransaction({ id: '99', description: 'Ghost' })
      vi.mocked(transactionsService.update).mockResolvedValue(updated)

      await store.updateTransaction('99', { description: 'Ghost' })

      expect(store.items).toHaveLength(1)
      expect(store.items[0].id).toBe('1')
    })

    it('calls fetchCategories when categories are updated', async () => {
      const store = useTransactionsStore()
      store.items = [makeTransaction({ id: '1' })]

      const updated = makeTransaction({ id: '1', categories: ['Food'] })
      vi.mocked(transactionsService.update).mockResolvedValue(updated)

      await store.updateTransaction('1', { categories: ['Food'] })

      expect(transactionsService.getCategories).toHaveBeenCalled()
    })

    it('does not call fetchCategories when categories are not updated', async () => {
      const store = useTransactionsStore()
      store.items = [makeTransaction({ id: '1' })]

      const updated = makeTransaction({ id: '1', description: 'Updated' })
      vi.mocked(transactionsService.update).mockResolvedValue(updated)

      await store.updateTransaction('1', { description: 'Updated' })

      expect(transactionsService.getCategories).not.toHaveBeenCalled()
    })
  })

  // ── bulkUpdateCategory ─────────────────────────────────────────────────────

  describe('bulkUpdateCategory', () => {
    it('adds category to targeted transactions', async () => {
      const store = useTransactionsStore()
      store.items = [
        makeTransaction({ id: '1', categories: [] }),
        makeTransaction({ id: '2', categories: [] }),
      ]

      await store.bulkUpdateCategory(['1'], 'Food')

      expect(store.items[0].categories).toContain('Food')
      expect(store.items[1].categories).not.toContain('Food')
    })

    it('does not duplicate a category already present', async () => {
      const store = useTransactionsStore()
      store.items = [makeTransaction({ id: '1', categories: ['Food'] })]

      await store.bulkUpdateCategory(['1'], 'Food')

      expect(store.items[0].categories).toEqual(['Food'])
    })

    it('preserves existing categories when adding a new one', async () => {
      const store = useTransactionsStore()
      store.items = [makeTransaction({ id: '1', categories: ['Transport'] })]

      await store.bulkUpdateCategory(['1'], 'Food')

      expect(store.items[0].categories).toEqual(['Transport', 'Food'])
    })

    it('calls fetchCategories after bulk update', async () => {
      const store = useTransactionsStore()
      store.items = [makeTransaction({ id: '1' })]

      await store.bulkUpdateCategory(['1'], 'Food')

      expect(transactionsService.getCategories).toHaveBeenCalled()
    })
  })
})
