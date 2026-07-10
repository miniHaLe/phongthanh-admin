/**
 * Shared makeMockApi<T> factory — all 23 master-data configs use this.
 * Eliminates copy-paste drift; CRUD logic lives in exactly one place.
 */
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow } from '@/lib/mock-error'
import type { BaseEntity, ListParams, PagedResult } from '@/mock/seed'
import type { MockApi } from '@/types/crud-types'

let _idCounter = 10000

function genId(): string {
  return String(++_idCounter)
}

function now(): string {
  return new Date().toISOString()
}

/**
 * Applies search + filter + sort + pagination to an in-memory array.
 * Search matches any string field case-insensitively.
 */
function applyParams<T extends BaseEntity>(
  rows: T[],
  params: ListParams,
): PagedResult<T> {
  let result = [...rows]

  // Search: match any string value
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter((r) =>
      Object.values(r as Record<string, unknown>).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      ),
    )
  }

  // Filters: exact match per key
  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== '' && v !== null) {
        result = result.filter(
          (r) => String((r as Record<string, unknown>)[k]) === String(v),
        )
      }
    }
  }

  // Sort
  if (params.sort) {
    const key = params.sort as keyof T
    const dir = params.dir === 'desc' ? -1 : 1
    result = result.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * dir
      return String(av ?? '').localeCompare(String(bv ?? ''), 'vi') * dir
    })
  }

  const total = result.length
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const start = (page - 1) * pageSize
  const data = result.slice(start, start + pageSize)

  return { data, total, page, pageSize }
}

/**
 * Factory: wrap a mutable in-memory rows array with list/get/create/update/remove.
 * The rows array is mutated in place so all operations are consistent per session.
 */
export function makeMockApi<T extends BaseEntity>(rows: T[]): MockApi<T> {
  return {
    async list(params: ListParams): Promise<PagedResult<T>> {
      await mockDelay(300, 200)
      maybeThrow(0.05)
      return applyParams(rows, params)
    },

    async get(id: string): Promise<T> {
      await mockDelay(200, 100)
      const row = rows.find((r) => r.id === id)
      if (!row) throw new Error(`Không tìm thấy bản ghi id=${id}`)
      return { ...row }
    },

    async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
      await mockDelay(300, 150)
      const row: T = {
        ...(data as T),
        id: genId(),
        createdAt: now(),
        active: (data as Partial<T> & { active?: boolean }).active ?? true,
      }
      rows.unshift(row)
      return { ...row }
    },

    async update(id: string, data: Partial<T>): Promise<T> {
      await mockDelay(300, 150)
      const idx = rows.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error(`Không tìm thấy bản ghi id=${id}`)
      const updated: T = { ...rows[idx], ...data, updatedAt: now() }
      rows[idx] = updated
      return { ...updated }
    },

    async remove(id: string): Promise<void> {
      await mockDelay(200, 100)
      const idx = rows.findIndex((r) => r.id === id)
      if (idx !== -1) rows.splice(idx, 1)
    },
  }
}

// Re-export all mock datasets
export { KHACH_HANG_ROWS, khachHangApi } from './khach-hang.mock'
export { MODEL_ROWS, modelApi } from './model.mock'
export { NHA_KHO_ROWS, nhaKhoApi } from './nha-kho.mock'
export { NGAN_CHUA_ROWS, nganChuaApi } from './ngan-chua.mock'
export { NHOM_HANG_HOA_ROWS, nhomHangHoaApi } from './nhom-hang-hoa.mock'
export { HANG_HOA_ROWS, hangHoaApi } from './hang-hoa.mock'
export { NHA_SAN_XUAT_ROWS, nhaSanXuatApi } from './nha-san-xuat.mock'
export { SAN_PHAM_ROWS, sanPhamApi } from './san-pham.mock'
export { KHU_VUC_ROWS, khuVucApi } from './khu-vuc.mock'
export { PHUONG_XA_ROWS, phuongXaApi } from './phuong-xa.mock'
export { THOI_HAN_ROWS, thoiHanApi } from './thoi-han.mock'
export { PHI_GIAO_ROWS, phiGiaoApi } from './phi-giao.mock'
export { DON_VI_TINH_ROWS, donViTinhApi } from './don-vi-tinh.mock'
export { NHOM_SAN_PHAM_ROWS, nhomSanPhamApi } from './nhom-san-pham.mock'
export { LOI_SUA_CHUA_ROWS, loiSuaChuaApi } from './loi-sua-chua.mock'
export { CHI_NHANH_ROWS, chiNhanhApi } from './chi-nhanh.mock'
export { NGUOI_DUNG_ROWS, nguoiDungApi } from './nguoi-dung.mock'
export { NHAN_VIEN_ROWS, nhanVienApi } from './nhan-vien.mock'
export { PHONG_BAN_ROWS, phongBanApi } from './phong-ban.mock'
export { CHUC_VU_ROWS, chucVuApi } from './chuc-vu.mock'
export { NHOM_QUYEN_ROWS, nhomQuyenApi } from './nhom-quyen.mock'
export { MENU_ROWS, menuApi } from './menu.mock'
export { CHUC_NANG_ROWS, chucNangApi } from './chuc-nang.mock'
