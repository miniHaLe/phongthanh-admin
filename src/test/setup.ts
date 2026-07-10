/**
 * Vitest global setup — loaded once before every test file.
 * Registers jest-dom matchers (toBeInTheDocument, toHaveTextContent, …).
 */
import '@testing-library/jest-dom/vitest'

// happy-dom lacks URL.createObjectURL — stub it for image-preview components.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock'
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {}
}

// The mock list/detail APIs inject a 5% random failure via maybeThrow(0.05)
// (reads Math.random). In tests we want deterministic loads, so default
// Math.random to a value above every injection threshold. Tests that need
// their own randomness still override this with vi.spyOn(Math, 'random').
import { beforeEach } from 'vitest'
const realRandom = Math.random
beforeEach(() => {
  Math.random = () => 0.999
})
// Expose the real PRNG in case a test explicitly wants it back.
;(globalThis as unknown as { __realRandom: () => number }).__realRandom =
  realRandom
