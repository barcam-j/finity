import { ref } from 'vue'
import { api } from '@/services/api'

interface CheckRow {
  date: string
  amount: number
  description: string
}

function rowKey(row: CheckRow): string {
  return `${row.date}|${row.amount}|${row.description}`
}

export function useImportDuplicateCheck() {
  const duplicateKeys = ref<Set<string>>(new Set())
  const checking = ref(false)

  async function checkDuplicates(rows: CheckRow[]) {
    if (!rows.length) return
    checking.value = true
    try {
      const result = await api.post<{ duplicate_indices: number[] }>(
        '/transactions/check-duplicates',
        { transactions: rows },
      )
      duplicateKeys.value = new Set(
        result.duplicate_indices.map(i => rowKey(rows[i]))
      )
    } catch {
      // non-critical — silent fail
    } finally {
      checking.value = false
    }
  }

  function isDuplicate(row: CheckRow): boolean {
    return duplicateKeys.value.has(rowKey(row))
  }

  function removeAllDuplicates<T extends CheckRow>(rows: T[]): T[] {
    const filtered = rows.filter(r => !duplicateKeys.value.has(rowKey(r)))
    duplicateKeys.value = new Set()
    return filtered
  }

  function reset() {
    duplicateKeys.value = new Set()
  }

  return { duplicateKeys, checking, checkDuplicates, isDuplicate, removeAllDuplicates, reset }
}
