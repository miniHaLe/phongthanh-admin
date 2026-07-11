import { useState } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RowSelectionState } from '@tanstack/react-table'
import { DataTable } from '@/components/shared'
import { useTableState } from '@/components/shared/data-table/use-table-state'
import { MOCK_TICKETS } from '@/domains/repair/mock-data'
import type { RepairTicket } from '@/domains/repair/types'
import { formatDate, formatDateTime, formatVND } from '@/lib/format'
import { renderWithProviders } from '@/test/render-with-providers'
import { RepairMobileCards } from '../RepairListPage'
import {
  REPAIR_COLUMN_LABELS,
  REPAIR_LEGACY_SORT_IDS,
  useRepairTableColumns,
} from './use-repair-table-columns'

const ticket: RepairTicket = {
  ...MOCK_TICKETS[0],
  id: 'repair-composite-fixture',
  soPhieu: 'PSC-COMPOSITE-001',
  soPhieuHang: 'HANG-COMPOSITE-002',
  soPhieuDaiLy: 'DAILY-COMPOSITE-003',
  soSerial: 'SERIAL-COMPOSITE-004',
  tinhTrang: 9,
  khachHang: {
    ...MOCK_TICKETS[0].khachHang,
    ten: 'Khách hàng composite',
    sdt: '0912345678',
    diaChi: '123 Nguyễn Huệ, Buôn Ma Thuột',
  },
  tenSanPham: 'Máy lạnh composite model 2026',
  daiLy: 'Đại lý composite',
  laMayDaSua: true,
  kyThuatId: 'tech-composite',
  kyThuat: 'Kỹ thuật composite',
  hinhThuc: 'bao_hanh',
  loaiBaoHanh: 'tai_tram',
  khuVuc: 'Buôn Ma Thuột',
  giaBaoGia: 1_250_000,
  ngayNhan: '2024-06-01T08:30:00.000Z',
  ngayHoanThanh: '2024-06-05T09:00:00.000Z',
  ngaySuaXong: '2024-06-04T10:00:00.000Z',
  ngayGiao: '2024-06-06T11:00:00.000Z',
  moTaLoi: 'Máy không hoạt động cần kiểm tra toàn bộ',
  cachGiaiQuyet: 'Đã thay linh kiện và kiểm tra hoạt động',
  nguoiNhan: 'Nhân viên composite',
}

function TableHarness() {
  const { columns } = useRepairTableColumns()
  return (
    <DataTable
      tableId="repair-list"
      columns={columns}
      data={[ticket]}
      enableRowSelection
      rowSelection={{}}
      onRowSelectionChange={() => {}}
      getRowId={(row) => row.id}
      tableLayout="content-safe"
      tableMinWidth={1560}
    />
  )
}

function MobileHarness() {
  const [selection, setSelection] = useState<RowSelectionState>({})
  return (
    <RepairMobileCards
      tickets={[ticket]}
      rowSelection={selection}
      onSelectionChange={setSelection}
    />
  )
}

describe('useRepairTableColumns', () => {
  beforeEach(() => {
    useTableState.setState({ tables: {} })
  })

  it('exposes only the approved composite group IDs to column configuration', () => {
    expect(REPAIR_COLUMN_LABELS.map(({ id }) => id)).toEqual([
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

  it('keeps every legacy sort ID as sort-only metadata and groups timeline sorting', () => {
    const { result } = renderHook(() => useRepairTableColumns())
    const byId = new Map(
      result.current.columns.map((column) => [column.id, column]),
    )

    for (const id of REPAIR_LEGACY_SORT_IDS) {
      expect(byId.get(id)?.meta?.presentation).toBe('sort-only')
      expect(byId.get(id)?.enableSorting).toBe(true)
    }

    expect(byId.get('timeline')?.meta?.compositeSortOptions).toEqual([
      { id: 'ngayNhan', label: 'Ngày nhận' },
      { id: 'ngayHt', label: 'Ngày hoàn thành' },
    ])
  })

  it('renders all legacy values and actions through composite cells', () => {
    renderWithProviders(<TableHarness />)

    for (const value of [
      ticket.soPhieu,
      ticket.soPhieuHang!,
      ticket.soPhieuDaiLy!,
      ticket.khachHang.ten,
      ticket.khachHang.sdt,
      ticket.khachHang.diaChi,
      ticket.tenSanPham,
      ticket.soSerial!,
      ticket.daiLy!,
      ticket.kyThuat,
      ticket.khuVuc!,
      formatVND(ticket.giaBaoGia),
      formatDateTime(ticket.ngayNhan),
      formatDate(ticket.ngayHoanThanh),
      formatDateTime(ticket.ngaySuaXong),
      formatDateTime(ticket.ngayGiao),
      ticket.moTaLoi,
      ticket.cachGiaiQuyet!,
      ticket.nguoiNhan,
    ]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0)
    }

    expect(screen.getByText('Bản đồ')).toBeInTheDocument()
    expect(screen.getByText('Định vị')).toBeInTheDocument()
    for (const action of [
      'Đổi tình trạng',
      'Xem chi tiết',
      'Cấp linh kiện cho kỹ thuật',
      'Giao Máy',
      'Thêm lịch hẹn',
    ]) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument()
    }
  })

  it('marks ticket, phone, serial, dates, and cost as protected values', () => {
    renderWithProviders(<TableHarness />)
    const protectedValues = Array.from(
      document.querySelectorAll<HTMLElement>('[data-table-protected]'),
    ).map((element) => element.textContent?.trim())

    for (const value of [
      ticket.soPhieu,
      ticket.khachHang.sdt,
      ticket.soSerial,
      formatVND(ticket.giaBaoGia),
      formatDateTime(ticket.ngayNhan),
      formatDate(ticket.ngayHoanThanh),
    ]) {
      expect(protectedValues).toContain(value)
    }
  })

  it('keeps the default visible composition within the 1560px budget', () => {
    const { result } = renderHook(() => useRepairTableColumns())
    const total = result.current.columns
      .filter((column) => column.meta?.presentation !== 'sort-only')
      .reduce((sum, column) => sum + (column.size ?? 0), 0)

    expect(total).toBeLessThanOrEqual(1560)
  })

  it('keeps mobile selection, detail navigation, and row actions intact', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MobileHarness />)

    const selection = screen.getByRole('checkbox', {
      name: `Chọn phiếu ${ticket.soPhieu}`,
    })
    await user.click(selection)
    expect(selection).toBeChecked()
    expect(screen.getByRole('link', { name: ticket.soPhieu })).toHaveAttribute(
      'href',
      `/sua-chua-bao-hanh/${ticket.id}`,
    )
    expect(screen.getByRole('button', { name: 'Xem chi tiết' })).toHaveClass(
      'h-11',
      'w-11',
    )
  })
})
