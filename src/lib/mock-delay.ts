/**
 * Simulated network latency for mock queries (C4 — one owner).
 * All mock generators import this; no inline setTimeout delays elsewhere.
 */
export function mockDelay(ms = 400, jitter = 250): Promise<void> {
  const wait = ms + Math.random() * jitter
  return new Promise((resolve) => setTimeout(resolve, wait))
}
