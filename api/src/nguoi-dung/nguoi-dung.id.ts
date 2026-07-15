import { randomBytes } from 'node:crypto'

export function generateNguoiDungId(): string {
  return `nd-${randomBytes(6).toString('hex')}`
}
