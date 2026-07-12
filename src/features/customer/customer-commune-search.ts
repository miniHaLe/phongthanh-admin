import type { VietnamCommune } from '@/types/vietnam-administrative-types'

export function normalizeAdministrativeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/\s+/g, ' ')
}

export function findUniqueExactCommune(
  query: string,
  communes: VietnamCommune[],
): VietnamCommune | undefined {
  const normalized = normalizeAdministrativeName(query)
  if (!normalized) return undefined
  const exact = communes.filter((commune) => {
    const name = normalizeAdministrativeName(
      commune.normalizedName || commune.name,
    )
    const displayName = normalizeAdministrativeName(commune.name)
    return normalized === name || normalized === displayName
  })
  return exact.length === 1 ? exact[0] : undefined
}
