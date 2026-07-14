import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchVietnamAdministrativeSnapshot } from '@/api/vietnam-geography'
import { nganHangConfig } from '@/config/crud-configs/ngan-hang.config'
import type { NganHang } from '@/domains/hr/types'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'

export const CUSTOMER_GEOGRAPHY_QUERY_KEY = ['ref-data', 'dia-ly'] as const
export const CUSTOMER_BANKS_QUERY_KEY = ['ref-data', 'ngan-hang'] as const

const BANK_REFERENCE_STALE_TIME = 30 * 60 * 1000

export function customerGeographyQueryOptions() {
  return queryOptions({
    queryKey: CUSTOMER_GEOGRAPHY_QUERY_KEY,
    queryFn: fetchVietnamAdministrativeSnapshot,
    staleTime: Infinity,
  })
}

function customerBanksQueryOptions() {
  return queryOptions({
    queryKey: CUSTOMER_BANKS_QUERY_KEY,
    queryFn: async () => {
      const result = await nganHangConfig.mockApi.list({
        page: 1,
        pageSize: 200,
        sort: 'tenNganHang',
        dir: 'asc',
        filters: { active: true },
      })
      return result.data
    },
    staleTime: BANK_REFERENCE_STALE_TIME,
  })
}

export interface CustomerReferenceData {
  geography?: VietnamAdministrativeSnapshot
  banks: NganHang[]
  loading: boolean
  error?: string
}

export function useCustomerReferenceData(
  enabled = true,
): CustomerReferenceData {
  const geographyQuery = useQuery({
    ...customerGeographyQueryOptions(),
    enabled,
  })
  const banksQuery = useQuery({
    ...customerBanksQueryOptions(),
    enabled,
  })
  const queryError = geographyQuery.error ?? banksQuery.error

  return {
    geography: geographyQuery.data,
    banks: banksQuery.data ?? [],
    loading: enabled && (geographyQuery.isPending || banksQuery.isPending),
    error: queryError
      ? queryError instanceof Error
        ? queryError.message
        : 'Không thể tải dữ liệu tham chiếu'
      : undefined,
  }
}
