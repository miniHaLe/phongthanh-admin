import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BanHangFilters } from './ban-hang-filters'
import { CapLinhKienFilters } from './cap-linh-kien-filters'
import { ChuyenKhoFilters } from './chuyen-kho-filters'
import { TraHangFilters } from './tra-hang-filters'

function expectResponsiveFields(root: HTMLElement, labels: readonly string[]) {
  expect(root).toHaveClass('col-span-full', 'min-w-0')
  for (const label of labels) {
    const control = screen.getByLabelText(label)
    expect(control).toHaveClass('h-11', 'text-base', 'md:h-8', 'md:text-sm')
  }
}

describe('stockout filters', () => {
  it('normalizes Bán hàng labels and responsive widths', () => {
    const { container } = render(
      <BanHangFilters filters={{ soPhieu: 'BH-001' }} onChange={vi.fn()} />,
    )
    expectResponsiveFields(container.firstElementChild as HTMLElement, [
      'Chi nhánh',
      'Nhà kho',
      'Hình thức thu chi',
      'Số phiếu / Ghi chú',
      'Tên khách hàng',
      'Mã hàng / Tên hàng',
      'Từ ngày',
      'Đến ngày',
    ])
    expect(screen.getByLabelText('Số phiếu / Ghi chú')).toHaveValue('BH-001')
  })

  it('normalizes Cấp linh kiện labels and responsive widths', () => {
    const { container } = render(
      <CapLinhKienFilters
        filters={{ soPhieuCap: 'CLK-001' }}
        onChange={vi.fn()}
      />,
    )
    expectResponsiveFields(container.firstElementChild as HTMLElement, [
      'Chi nhánh',
      'Kỹ thuật viên',
      'Số phiếu cấp',
      'Từ ngày',
      'Đến ngày',
    ])
    expect(screen.getByLabelText('Số phiếu cấp')).toHaveValue('CLK-001')
  })

  it('normalizes Chuyển kho labels and responsive widths', () => {
    const { container } = render(
      <ChuyenKhoFilters filters={{ soPhieu: 'CK-001' }} onChange={vi.fn()} />,
    )
    expectResponsiveFields(container.firstElementChild as HTMLElement, [
      'Từ chi nhánh',
      'Đến chi nhánh',
      'Số phiếu',
      'Trạng thái',
      'Từ ngày',
      'Đến ngày',
    ])
    expect(screen.getByLabelText('Số phiếu')).toHaveValue('CK-001')
  })

  it('normalizes Trả hàng labels and responsive widths', () => {
    const { container } = render(
      <TraHangFilters filters={{ soPhieu: 'TH-001' }} onChange={vi.fn()} />,
    )
    expectResponsiveFields(container.firstElementChild as HTMLElement, [
      'Chi nhánh',
      'Hình thức trả',
      'Số phiếu',
      'Từ ngày',
      'Đến ngày',
    ])
    expect(screen.getByLabelText('Số phiếu')).toHaveValue('TH-001')
  })
})
