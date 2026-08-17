import { describe, it, expect } from 'vitest'
import { fetchWithTimeout } from '@/lib/apiHelpers'

describe('fetchWithTimeout', () => {
  it('resolves with the promise value when it resolves before the timeout', async () => {
    const fast = new Promise<string>((resolve) => resolve('ok'))
    await expect(fetchWithTimeout(fast, 5000)).resolves.toBe('ok')
  })

  it('resolves immediately for an already-resolved promise', async () => {
    await expect(fetchWithTimeout(Promise.resolve(42), 5000)).resolves.toBe(42)
  })

  it('propagates the rejection when the promise rejects before the timeout', async () => {
    const failing = new Promise<string>((_resolve, reject) => reject(new Error('backend down')))
    await expect(fetchWithTimeout(failing, 5000)).rejects.toThrow('backend down')
  })

  it('rejects with a timeout error when the promise hangs past the timeout', async () => {
    const hanging = new Promise<string>(() => {
      // Never resolves/rejects.
    })
    await expect(fetchWithTimeout(hanging, 50)).rejects.toThrow(/timed out/i)
  })

  it('clears the timeout timer after the promise resolves (no unhandled rejection)', async () => {
    // If the timer were not cleared, a late timeout rejection could surface as
    // an unhandled rejection. Resolve quickly and wait beyond the timeout to
    // ensure nothing throws.
    await fetchWithTimeout(Promise.resolve('done'), 30)
    await new Promise((r) => setTimeout(r, 80))
    // No assertion needed — reaching here without an unhandled rejection is
    // the success condition.
    expect(true).toBe(true)
  })
})
