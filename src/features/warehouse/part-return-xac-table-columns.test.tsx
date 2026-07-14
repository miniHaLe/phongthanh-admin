import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from '@/components/shared'
import type { PartReturnXac } from '@/domains/warehouse/types'
import { usePartReturnXacColumns } from './part-return-xac-table-columns'

function makeRow(
  id: string,
  tinhTrang: PartReturnXac['tinhTrang'],
): PartReturnXac {
  return {
    id,
    tinhTrang,
    maVanDon: `VD-${id}`,
    soPhieuCap: `CAP-${id}`,
    soPhieuSC: `SC-${id}`,
    soPhieuHang: `HANG-${id}`,
    model: 'Model',
    serial: `SERIAL-${id}`,
    nhaKho: 'Kho',
    nsx: 'NSX',
    maHang: `MH-${id}`,
    tenHang: 'Linh kiện',
    kyThuat: 'Kỹ thuật',
    mucDich: 'Sửa chữa',
    ngayTX: '2026-07-14',
    nguoiTX: 'admin',
    sl: 1,
    ngayTao: '2026-07-14',
    nguoiTao: 'admin',
    branchId: 'dak-lak',
  }
}

function Harness() {
  const columns = usePartReturnXacColumns()
  return (
    <DataTable
      tableId="part-return-xac-visible-number"
      columns={columns}
      data={[makeRow('2', 'Đã trả hãng'), makeRow('1', 'Chưa trả hãng')]}
      sorting={[{ id: 'tinhTrang', desc: false }]}
      enableRowSelection
      getRowId={(row) => row.id}
    />
  )
}

describe('part-return selection row numbers', () => {
  it('aligns numbered checkbox labels with the visible sorted rows', () => {
    render(<Harness />)

    const first = screen.getByRole('checkbox', { name: 'Chọn dòng 1' })
    const second = screen.getByRole('checkbox', { name: 'Chọn dòng 2' })
    expect(first.closest('tr')).toHaveTextContent('Chưa trả hãng')
    expect(second.closest('tr')).toHaveTextContent('Đã trả hãng')
  })
})
