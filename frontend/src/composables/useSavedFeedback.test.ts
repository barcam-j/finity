import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSavedFeedback } from './useSavedFeedback'

describe('useSavedFeedback', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with saved = false', () => {
    const { saved } = useSavedFeedback()
    expect(saved.value).toBe(false)
  })

  it('sets saved to true immediately after markSaved()', () => {
    const { saved, markSaved } = useSavedFeedback()
    markSaved()
    expect(saved.value).toBe(true)
  })

  it('resets saved to false after the default 3000ms', () => {
    const { saved, markSaved } = useSavedFeedback()
    markSaved()
    vi.advanceTimersByTime(2999)
    expect(saved.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(saved.value).toBe(false)
  })

  it('respects a custom duration', () => {
    const { saved, markSaved } = useSavedFeedback(1000)
    markSaved()
    vi.advanceTimersByTime(999)
    expect(saved.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(saved.value).toBe(false)
  })
})
