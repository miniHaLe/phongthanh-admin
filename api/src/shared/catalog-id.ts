import { randomBytes } from 'node:crypto'

export function generateCatalogId(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString('hex')}`
}
