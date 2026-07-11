import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useThuChiCompositeColumns } from './thu-chi-composite-table-columns'

describe('useThuChiCompositeColumns', () => {
  it('keeps finance fields sortable while rendering nine composite groups', () => {
    const { result } = renderHook(() => useThuChiCompositeColumns(vi.fn()))
    const visible = result.current.filter(
      (column) => column.meta?.presentation !== 'sort-only',
    )
    const sortOnly = result.current.filter(
      (column) => column.meta?.presentation === 'sort-only',
    )

    expect(visible.map((column) => column.id)).toEqual([
      'select',
      'statusType',
      'documentRefs',
      'party',
      'amount',
      'content',
      'created',
      'collected',
      'print',
    ])
    expect(sortOnly.map((column) => column.id)).toEqual(
      expect.arrayContaining([
        'tinhTrang',
        'loaiThuChi',
        'hinhThucId',
        'soChungTu',
        'soPhieuScNk',
        'tenKhachHang',
        'daiLy',
        'kyThuat',
        'soTien',
        'noiDung',
        'ngayLap',
        'nguoiTao',
        'ngayThuChi',
        'nguoiThuChi',
      ]),
    )
    expect(
      visible.reduce((total, column) => total + (column.size ?? 0), 0),
    ).toBeLessThanOrEqual(1560)
  })
})
