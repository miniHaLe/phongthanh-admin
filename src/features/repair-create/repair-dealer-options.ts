/** Complete mock dealer lookup used until the backend paged lookup lands. */
import { KHACH_HANG_ROWS } from '@/mock/masterdata/khach-hang.mock'
import type { RepairDealerOption } from './repair-form-contract'

const DEALER_TYPES = new Set([2, 4])

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
}

export async function searchRepairDealers(
  query: string,
): Promise<RepairDealerOption[]> {
  const normalizedQuery = normalize(query.trim())
  return KHACH_HANG_ROWS.filter(
    (row) => row.active && DEALER_TYPES.has(row.loaiKhachHangId),
  )
    .filter((row) => {
      if (!normalizedQuery) return true
      return normalize(`${row.tenKH} ${row.dienThoai}`).includes(
        normalizedQuery,
      )
    })
    .map((row) => {
      const primary = row.daiLyId
        ? KHACH_HANG_ROWS.find((candidate) => candidate.id === row.daiLyId)
        : undefined
      return {
        id: row.id,
        label: row.tenKH,
        daiLyChinh: primary?.tenKH ?? row.daiLyTen ?? row.tenKH,
        dienThoai: row.dienThoai,
        diaChi: row.diaChi ?? '',
        email: row.email ?? '',
      }
    })
}
