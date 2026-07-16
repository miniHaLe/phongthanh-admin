import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { hangHoaConfig } from '@/config/crud-configs/hang-hoa.config'
import type { HangHoa } from '@/types/masterdata-types'
import HangHoaPage from './HangHoaPage'

describe('HangHoaPage export label', () => {
  it('uses the standardized plain list export label', () => {
    renderWithProviders(<HangHoaPage />)
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
  })
})

const goodsRow: HangHoa = {
  id: 'hh-test-1',
  maHH: 'HHTEST001',
  maHHPhu: 'HHPTEST001',
  tenHH: 'Sản phẩm kiểm thử cột',
  tenTiengAnh: 'Column Render Test Item',
  nhomHangHoaId: 'nhom-1',
  modelDungChung: false,
  donViTinhId: 'dvt-1',
  coSerial: false,
  phatSinhTuDong: false,
  nguoiTao: 'Người Tạo Kiểm Thử',
  tonKho: 0,
  active: true,
  createdAt: '2026-07-16T00:00:00.000Z',
}

describe('HangHoaPage plain-accessor column rendering', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows accessor values for config columns without a custom renderCell', async () => {
    vi.spyOn(hangHoaConfig.mockApi, 'list').mockResolvedValue({
      data: [goodsRow],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    renderWithProviders(<HangHoaPage />)

    // Mã hàng, Mã hàng phụ, Tên hàng, Tiếng Anh, Người tạo are plain accessors
    // (no renderCell). The bespoke inline map used to emit `cell: undefined`,
    // which erased TanStack's default renderValue() and normalized every value
    // to an em dash. They must render their real values instead.
    expect(await screen.findByText('HHTEST001')).toBeInTheDocument()
    expect(await screen.findByText('HHPTEST001')).toBeInTheDocument()
    expect(
      await screen.findByText('Sản phẩm kiểm thử cột'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Column Render Test Item'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Người Tạo Kiểm Thử')).toBeInTheDocument()
  })
})
