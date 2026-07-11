import { describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table/data-table'
import { STATUS_LABEL } from '@/domains/repair/status'
import { ISSUED_USAGE_ROWS } from '@/domains/warehouse/list-data'
import type {
  InventoryRow,
  IssuedPartUsage,
  PartReturn,
  PartReturnXac,
} from '@/domains/warehouse/types'
import { useInventoryCompositeColumns } from './inventory-composite-table-columns'
import { useIssuedUsageColumns } from './issued-usage-table-columns'
import { usePartReturnColumns } from './part-return-table-columns'
import { usePartReturnXacColumns } from './part-return-xac-table-columns'

function visibleIds<T>(columns: ColumnDef<T, unknown>[]) {
  return columns
    .filter((column) => column.meta?.presentation !== 'sort-only')
    .map((column) => column.id)
}

function sortOnlyIds<T>(columns: ColumnDef<T, unknown>[]) {
  return columns
    .filter((column) => column.meta?.presentation === 'sort-only')
    .map((column) => column.id)
}

function visibleWidth<T>(columns: ColumnDef<T, unknown>[]) {
  return columns
    .filter((column) => column.meta?.presentation !== 'sort-only')
    .reduce((total, column) => total + (column.size ?? 0), 0)
}

describe('warehouse composite table columns', () => {
  it('maps every stock field into seven visible groups and hidden sort targets', () => {
    const { result } = renderHook(() =>
      useInventoryCompositeColumns({
        page: 1,
        pageSize: 20,
        onEdit: vi.fn(),
        onDetail: vi.fn(),
      }),
    )

    expect(visibleIds<InventoryRow>(result.current)).toEqual([
      'indexActions',
      'location',
      'itemIdentity',
      'opening',
      'movement',
      'closing',
      'period',
    ])
    expect(sortOnlyIds<InventoryRow>(result.current)).toEqual(
      expect.arrayContaining([
        'branchId',
        'khoTen',
        'nganChua',
        'maHang',
        'tenHang',
        'nhomHang',
        'model',
        'nhaSanXuat',
        'giaVonDauKy',
        'tonDauKy',
        'nhapTrongKy',
        'xuatTrongKy',
        'ton',
        'giaVonTrongKy',
        'tonCuoiKy',
        'tongTien',
        'kyLabel',
      ]),
    )
    expect(
      result.current.find((column) => column.id === 'period')?.meta
        ?.compositeSortOptions,
    ).toEqual([{ id: 'kyLabel', label: 'Kỳ' }])
    expect(sortOnlyIds<InventoryRow>(result.current)).not.toContain('coSerial')
    expect(visibleWidth(result.current)).toBeLessThanOrEqual(1560)
  })

  it('preserves every issued-part sortable field in nine visible groups', () => {
    const { result } = renderHook(() => useIssuedUsageColumns())

    expect(visibleIds<IssuedPartUsage>(result.current)).toEqual([
      'statusActions',
      'voucherRefs',
      'itemIdentity',
      'location',
      'assignment',
      'issue',
      'delivery',
      'recovery',
      'detail',
    ])
    expect(sortOnlyIds<IssuedPartUsage>(result.current)).toHaveLength(19)
    expect(visibleWidth(result.current)).toBeLessThanOrEqual(1560)
  })

  it('renders the issued voucher status label beside its protected number', () => {
    const row = ISSUED_USAGE_ROWS[0]
    const { result } = renderHook(() => useIssuedUsageColumns())

    render(
      <DataTable
        tableId="issued-voucher-status-test"
        columns={result.current}
        data={[row]}
      />,
    )

    expect(
      screen.getByText(STATUS_LABEL[row.ticketStatusId], {
        selector: 'span:not(.sr-only)',
      }),
    ).toBeVisible()
    expect(screen.getByText(row.soPhieuHang)).toHaveAttribute(
      'data-table-protected',
      'true',
    )
  })

  it('preserves returned-part approval fields in seven visible groups', () => {
    const { result } = renderHook(() => usePartReturnColumns())

    expect(visibleIds<PartReturn>(result.current)).toEqual([
      'selectIndex',
      'statusAction',
      'itemIdentity',
      'voucherRefs',
      'assignment',
      'created',
      'approved',
    ])
    expect(sortOnlyIds<PartReturn>(result.current)).toHaveLength(16)
    expect(visibleWidth(result.current)).toBeLessThanOrEqual(1560)
  })

  it('preserves confirmed-return tracking fields in eight visible groups', () => {
    const { result } = renderHook(() => usePartReturnXacColumns())

    expect(visibleIds<PartReturnXac>(result.current)).toEqual([
      'selectIndex',
      'statusTracking',
      'voucherRefs',
      'itemLocation',
      'assignment',
      'recovery',
      'quantity',
      'created',
    ])
    expect(sortOnlyIds<PartReturnXac>(result.current)).toHaveLength(18)
    expect(visibleWidth(result.current)).toBeLessThanOrEqual(1560)
  })
})
