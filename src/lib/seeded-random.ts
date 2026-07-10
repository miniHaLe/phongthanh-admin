/**
 * Deterministic PRNG (mulberry32) — the ONE PRNG for the whole app (C4).
 * All mock generators seed from here so data is stable across reloads
 * (no hydration flicker, stable filter-count assertions).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A small seeded-random toolkit built on a single mulberry32 stream. */
export class SeededRandom {
  private next: () => number
  constructor(seed = 42) {
    this.next = mulberry32(seed)
  }
  /** Float in [0, 1). */
  float(): number {
    return this.next()
  }
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
  /** Pick one element. */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }
  /** Pick a weighted element. `weights` parallels `arr`. */
  weighted<T>(arr: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((a, b) => a + b, 0)
    let r = this.next() * total
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i]
      if (r <= 0) return arr[i]
    }
    return arr[arr.length - 1]
  }
  /** true with probability p. */
  bool(p = 0.5): boolean {
    return this.next() < p
  }
  /** Shuffle a copy (Fisher–Yates). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  /** ISO date within the last `days` days from `ref` (default now). */
  isoDateWithin(days: number, ref: number = Date.now()): string {
    const offset = Math.floor(this.next() * days) * 86_400_000
    const secs = Math.floor(this.next() * 86_400_000)
    return new Date(ref - offset - secs).toISOString()
  }
}
