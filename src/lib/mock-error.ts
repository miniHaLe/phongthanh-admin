/**
 * Simulated error injection for mock queries (C4 — one owner).
 * Lets pages exercise their error/retry states.
 */
export interface MockError {
  code: string
  message: string
}

export class MockApiError extends Error {
  code: string
  constructor(
    message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
    code = 'MOCK_ERR',
  ) {
    super(message)
    this.name = 'MockApiError'
    this.code = code
  }
}

/** Throw a mock error with probability `rate` (default 0 = never). */
export function maybeThrow(rate = 0): void {
  if (rate > 0 && Math.random() < rate) {
    throw new MockApiError()
  }
}
