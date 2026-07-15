import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFor } from '@/api/api-for'
import {
  CHI_NHANH_ROWS,
  DON_VI_TINH_ROWS,
  HANG_HOA_ROWS,
  KHACH_HANG_ROWS,
  MODEL_ROWS,
  NGAN_CHUA_ROWS,
  NHA_KHO_ROWS,
  NHA_SAN_XUAT_ROWS,
  NHOM_HANG_HOA_ROWS,
  NHOM_SAN_PHAM_ROWS,
  NHOM_QUYEN_ROWS,
  SAN_PHAM_ROWS,
} from '@/mock/masterdata'
import type { BaseEntity } from '@/mock/seed'
import type {
  ChiNhanh,
  DonViTinh,
  HangHoa,
  KhachHang,
  Model,
  NganChua,
  NhaKho,
  NhaSanXuat,
  NhomHangHoa,
  NhomQuyen,
  NhomSanPham,
  SanPham,
} from '@/types/masterdata-types'

const LOOKUP_PAGE_SIZE = 200
const RESOURCE_BRANCH_IDS: Record<string, string> = {
  'dak-lak': 'cn-1',
  'dak-nong': 'cn-2',
  'ctv-tuyen-huyen': 'cn-3',
}

export interface LookupResourceMap {
  'chi-nhanh': ChiNhanh
  'don-vi-tinh': DonViTinh
  'hang-hoa': HangHoa
  'khach-hang': KhachHang
  model: Model
  'ngan-chua': NganChua
  'nha-kho': NhaKho
  'nha-san-xuat': NhaSanXuat
  'nhom-hang-hoa': NhomHangHoa
  'nhom-san-pham': NhomSanPham
  'nhom-quyen': NhomQuyen
  'san-pham': SanPham
}

export type LookupResource = keyof LookupResourceMap
export type LookupOption = { label: string; value: string }

/** Translate immutable UI branch ids to real masterdata FK ids. */
export function toResourceBranchId(branchId: string): string {
  return RESOURCE_BRANCH_IDS[branchId] ?? branchId
}

const LOOKUP_SEEDS: {
  [R in LookupResource]: LookupResourceMap[R][]
} = {
  'chi-nhanh': CHI_NHANH_ROWS,
  'don-vi-tinh': DON_VI_TINH_ROWS,
  'hang-hoa': HANG_HOA_ROWS,
  'khach-hang': KHACH_HANG_ROWS,
  model: MODEL_ROWS,
  'ngan-chua': NGAN_CHUA_ROWS,
  'nha-kho': NHA_KHO_ROWS,
  'nha-san-xuat': NHA_SAN_XUAT_ROWS,
  'nhom-hang-hoa': NHOM_HANG_HOA_ROWS,
  'nhom-san-pham': NHOM_SAN_PHAM_ROWS,
  'nhom-quyen': NHOM_QUYEN_ROWS,
  'san-pham': SAN_PHAM_ROWS,
}

/** Fetch every lookup row while respecting the server's page-size ceiling. */
export async function fetchLookupRows<R extends LookupResource>(
  resource: R,
): Promise<LookupResourceMap[R][]> {
  const api = apiFor(resource, LOOKUP_SEEDS[resource] as LookupResourceMap[R][])
  const rows: LookupResourceMap[R][] = []
  let page = 1

  while (true) {
    const result = await api.list({ page, pageSize: LOOKUP_PAGE_SIZE })
    rows.push(...result.data)

    if (rows.length >= result.total || result.data.length === 0) break
    page += 1
  }

  return rows
}

export function useLookup<R extends LookupResource>(resource: R) {
  const query = useQuery({
    queryKey: ['lookup', resource],
    queryFn: () => fetchLookupRows(resource),
    staleTime: 30_000,
  })
  const rows = useMemo(() => query.data ?? [], [query.data])
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows])

  return { ...query, rows, byId }
}

export async function loadLookupOptions<R extends LookupResource>(
  resource: R,
  getLabel: (row: LookupResourceMap[R]) => string,
): Promise<LookupOption[]> {
  const rows = await fetchLookupRows(resource)
  return rows.map((row) => ({ label: getLabel(row), value: row.id }))
}

/** Local filtering for autocomplete consumers already backed by useLookup. */
export function filterLookupOptions<T extends BaseEntity>(
  rows: T[],
  query: string,
  getLabel: (row: T) => string,
  getSearchText: (row: T) => string = getLabel,
  limit = 20,
): Promise<Array<{ id: string; label: string }>> {
  const normalized = query.trim().toLocaleLowerCase('vi')
  return Promise.resolve(
    rows
      .filter(
        (row) =>
          !normalized ||
          getSearchText(row).toLocaleLowerCase('vi').includes(normalized),
      )
      .slice(0, limit)
      .map((row) => ({ id: row.id, label: getLabel(row) })),
  )
}

export function useLoadedOptions(
  loadOptions: (() => Promise<LookupOption[]>) | undefined,
  fallback: LookupOption[] = [],
  enabled = true,
) {
  const [loaded, setLoaded] = useState<LookupOption[] | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !loadOptions) return

    let active = true
    setIsLoading(true)
    setError(null)

    loadOptions()
      .then((options) => {
        if (active) setLoaded(options)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(
          reason instanceof Error
            ? reason
            : new Error('Không tải được danh sách'),
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, loadOptions])

  return {
    options: loaded ?? fallback,
    isLoading,
    error,
  }
}
