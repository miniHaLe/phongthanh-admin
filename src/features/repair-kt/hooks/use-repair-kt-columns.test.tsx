import { describe, expect, it } from 'vitest'
import { renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '@/components/shared'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import type { RepairTicket } from '@/domains/repair/types'
import { formatDate, formatDateTime, formatVND } from '@/lib/format'
import { renderWithProviders } from '@/test/render-with-providers'
import {
  REPAIR_KT_COLUMN_LABELS,
  REPAIR_KT_LEGACY_SORT_IDS,
  useRepairKtColumns,
} from './use-repair-kt-columns'

const ticket: RepairTicket = {
  ...MOCK_TICKETS[0],
  id: 'repair-kt-composite-fixture',
  soPhieu: 'PSC-KT-COMPOSITE-001',
  soPhieuHang: 'HANG-KT-002',
  soPhieuDaiLy: 'DAILY-KT-003',
  soSerial: 'SERIAL-KT-004',
  khachHang: {
    ...MOCK_TICKETS[0].khachHang,
    ten: 'Khách hàng KT composite',
    sdt: '0987654321',
    diaChi: '45 Trần Phú, Gia Nghĩa',
  },
  tenSanPham: 'Tủ lạnh KT composite model 2026',
  kyThuat: 'Kỹ thuật viên KT',
  khuVuc: 'Gia Nghĩa',
  giaBaoGia: 2_500_000,
  ngayNhan: '2024-06-10T08:00:00.000Z',
  ngayGiao: '2024-06-15T09:30:00.000Z',
  noiDungSuaChua: 'Thay bo mạch và chạy kiểm tra tải',
  ghiChu: 'Khách đã xác nhận chi phí',
  nguoiNhan: 'Tiếp nhận KT',
}

function Harness() {
  const { columns } = useRepairKtColumns()
  return (
    <DataTable
      tableId="repair-kt-composite-test"
      columns={columns}
      data={[ticket]}
      tableLayout="content-safe"
      tableMinWidth={1560}
    />
  )
}

describe('useRepairKtColumns', () => {
  it('uses the shared repair composite group IDs', () => {
    expect(REPAIR_KT_COLUMN_LABELS.map(({ id }) => id)).toEqual([
      'status',
      'actions',
      'ticketRefs',
      'customer',
      'product',
      'assignment',
      'cost',
      'timeline',
      'notes',
      'receiver',
    ])
  })

  it('retains legacy field IDs as sort-only columns with multi-target groups', () => {
    const { result } = renderHook(() => useRepairKtColumns())
    const byId = new Map(
      result.current.columns.map((column) => [column.id, column]),
    )

    for (const id of REPAIR_KT_LEGACY_SORT_IDS) {
      expect(byId.get(id)?.meta?.presentation).toBe('sort-only')
      expect(byId.get(id)?.enableSorting).toBe(true)
    }
    expect(byId.get('timeline')?.meta?.compositeSortOptions).toEqual([
      { id: 'ngayNhan', label: 'Ngày nhận' },
      { id: 'ngayGiao', label: 'Ngày giao' },
    ])
    expect(byId.get('assignment')?.meta?.compositeSortOptions).toHaveLength(3)
  })

  it('renders all previous KT values and actions in the composite table', () => {
    renderWithProviders(<Harness />)

    for (const value of [
      ticket.soPhieu,
      ticket.soPhieuHang!,
      ticket.khachHang.ten,
      ticket.khachHang.sdt,
      ticket.khachHang.diaChi,
      ticket.tenSanPham,
      ticket.soSerial!,
      ticket.kyThuat,
      ticket.khuVuc!,
      formatVND(ticket.giaBaoGia),
      formatDateTime(ticket.ngayNhan),
      formatDate(ticket.ngayGiao),
      ticket.noiDungSuaChua!,
      ticket.ghiChu!,
      ticket.nguoiNhan,
    ]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0)
    }

    expect(
      screen.getByRole('button', { name: 'Xem chi tiết' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cập nhật hình ảnh' }),
    ).toBeInTheDocument()
  })

  it('marks KT identifiers, phone, serial, cost, and dates as protected', () => {
    renderWithProviders(<Harness />)
    const values = Array.from(
      document.querySelectorAll<HTMLElement>('[data-table-protected]'),
    ).map((element) => element.textContent?.trim())

    for (const value of [
      ticket.soPhieu,
      ticket.khachHang.sdt,
      ticket.soSerial,
      formatVND(ticket.giaBaoGia),
      formatDateTime(ticket.ngayNhan),
      formatDate(ticket.ngayGiao),
    ]) {
      expect(values).toContain(value)
    }
  })

  it('offers the timeline legacy sort targets from its composite header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Harness />)

    await user.click(
      screen.getByRole('button', {
        name: 'Chọn cách sắp xếp nhóm Thời gian',
      }),
    )
    expect(
      screen.getByRole('menuitem', { name: 'Sắp xếp theo Ngày nhận' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Sắp xếp theo Ngày giao' }),
    ).toBeInTheDocument()
  })

  it('keeps the KT default visible composition within 1560px', () => {
    const { result } = renderHook(() => useRepairKtColumns())
    const total = result.current.columns
      .filter((column) => column.meta?.presentation !== 'sort-only')
      .reduce((sum, column) => sum + (column.size ?? 0), 0)

    expect(total).toBeLessThanOrEqual(1560)
  })
})
