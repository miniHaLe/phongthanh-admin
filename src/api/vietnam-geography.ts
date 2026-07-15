import { isReal } from './api-for'
import { getApiJson } from './http-client'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'

let cachedSnapshot: VietnamAdministrativeSnapshot | undefined
let inFlightSnapshot: Promise<VietnamAdministrativeSnapshot> | undefined

export function setMockVietnamAdministrativeSnapshot(
  snapshot: VietnamAdministrativeSnapshot,
): void {
  cachedSnapshot = snapshot
  inFlightSnapshot = undefined
}

export function resetVietnamAdministrativeSnapshotCache(): void {
  cachedSnapshot = undefined
  inFlightSnapshot = undefined
}

export async function fetchVietnamAdministrativeSnapshot(): Promise<VietnamAdministrativeSnapshot> {
  if (cachedSnapshot) return cachedSnapshot
  if (inFlightSnapshot) return inFlightSnapshot

  inFlightSnapshot = (async () => {
    if (!isReal('dia-ly')) {
      const { VIETNAM_ADMINISTRATIVE_SNAPSHOT } =
        await import('@/data/vietnam-administrative-snapshot')
      return VIETNAM_ADMINISTRATIVE_SNAPSHOT
    }

    return getApiJson<VietnamAdministrativeSnapshot>('/api/v1/dia-ly')
  })()

  try {
    cachedSnapshot = await inFlightSnapshot
    return cachedSnapshot
  } finally {
    inFlightSnapshot = undefined
  }
}
