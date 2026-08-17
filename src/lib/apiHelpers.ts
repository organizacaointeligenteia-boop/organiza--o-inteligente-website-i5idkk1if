/**
 * Race a promise against a timeout.
 *
 * If the promise resolves/rejects before the timeout elapses, its result/error
 * is propagated. If the timeout wins, the returned promise rejects with a
 * timeout error so callers can fall back to static catalog data.
 */
export async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
