/**
 * Synchronous Tỉnh/Phường-Xã name resolvers for the Khu Vực table cells.
 * CrudTablePage renders cells synchronously, so this keeps a lightweight
 * code→name index primed from the geography snapshot. The index is refreshed
 * whenever `primeKhuVucGeographyNames` runs (the Khu Vực page calls it once the
 * snapshot query resolves); before that it falls back to showing the raw code.
 */
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'

let provinceNames: Map<string, string> = new Map()
let communeNames: Map<string, string> = new Map()

export function primeKhuVucGeographyNames(
  snapshot: VietnamAdministrativeSnapshot,
): void {
  provinceNames = new Map(snapshot.provinces.map((p) => [p.code, p.name]))
  communeNames = new Map(
    snapshot.communes.map((c) => [
      c.code,
      `${c.type ? `${c.type} ` : ''}${c.name}`.trim(),
    ]),
  )
}

export function provinceNameForCode(code: string | undefined): string {
  if (!code) return '—'
  return provinceNames.get(code) ?? code
}

export function communeNameForCode(code: string | undefined): string {
  if (!code) return '—'
  return communeNames.get(code) ?? code
}
