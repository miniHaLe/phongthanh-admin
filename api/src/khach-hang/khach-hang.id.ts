import { randomBytes } from 'node:crypto'

/** New khach-hang rows get a `kh-<random>` id — the fixture uses `kh-1..50`,
 * new rows must never collide with those (hex suffix, not sequential). */
export function generateKhachHangId(): string {
  return `kh-${randomBytes(6).toString('hex')}`
}
