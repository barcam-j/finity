import { describe, it, expect } from 'vitest'
import { ApiError } from './errors'

describe('ApiError', () => {
  it('stores the message', () => {
    const err = new ApiError('Not found', 404)
    expect(err.message).toBe('Not found')
  })

  it('stores the status code', () => {
    const err = new ApiError('Unauthorized', 401)
    expect(err.status).toBe(401)
  })

  it('is an instance of Error', () => {
    const err = new ApiError('Server error', 500)
    expect(err).toBeInstanceOf(Error)
  })

  it('has name ApiError', () => {
    const err = new ApiError('Bad request', 400)
    expect(err.name).toBe('ApiError')
  })
})
