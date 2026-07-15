import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CrudLookups } from '@/types/crud-types'
import { customerGeographyQueryOptions } from './use-customer-reference-data'

export const CUSTOMER_PROVINCE_NAMES_LOOKUP = 'customerProvinceNames'
export const CUSTOMER_COMMUNE_NAMES_LOOKUP = 'customerCommuneNames'

export interface GeographyOption {
  label: string
  value: string
}

export interface GeographyLookupResult {
  lookups?: CrudLookups
  provinceOptions: GeographyOption[]
  isReady: boolean
  isLoading: boolean
  error?: string
}

export function useGeographyLookup(): GeographyLookupResult {
  const query = useQuery(customerGeographyQueryOptions())
  const lookups = useMemo<CrudLookups | undefined>(() => {
    if (!query.data) return undefined

    return {
      [CUSTOMER_PROVINCE_NAMES_LOOKUP]: new Map(
        query.data.provinces.map((item) => [item.code, item.name]),
      ),
      [CUSTOMER_COMMUNE_NAMES_LOOKUP]: new Map(
        query.data.communes.map((item) => [item.code, item.name]),
      ),
    }
  }, [query.data])
  const provinceOptions = useMemo(
    () =>
      query.data?.provinces.map((item) => ({
        label: item.name,
        value: item.code,
      })) ?? [],
    [query.data],
  )

  return {
    lookups,
    provinceOptions,
    isReady: query.isSuccess,
    isLoading: query.isPending,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Không thể tải danh mục địa chỉ'
      : undefined,
  }
}
