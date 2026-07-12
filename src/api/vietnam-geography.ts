import { isReal } from './api-for'
import { getApiJson } from './http-client'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'

let cachedSnapshot: VietnamAdministrativeSnapshot | undefined

export function setMockVietnamAdministrativeSnapshot(
  snapshot: VietnamAdministrativeSnapshot,
): void {
  cachedSnapshot = snapshot
}

export async function fetchVietnamAdministrativeSnapshot(): Promise<VietnamAdministrativeSnapshot> {
  if (cachedSnapshot) return cachedSnapshot
  if (!isReal('dia-ly')) {
    const { VIETNAM_ADMINISTRATIVE_SNAPSHOT } =
      await import('@/data/vietnam-administrative-snapshot')
    cachedSnapshot = VIETNAM_ADMINISTRATIVE_SNAPSHOT
    return cachedSnapshot
  }

  cachedSnapshot =
    await getApiJson<VietnamAdministrativeSnapshot>('/api/v1/dia-ly')
  return cachedSnapshot
}
