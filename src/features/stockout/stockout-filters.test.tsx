import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render-with-providers'
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
    const { container } = renderWithProviders(
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
    const { container } = renderWithProviders(
      <CapLinhKienFilters
        filters={{ soPhieuCap: 'CLK-001' }}
        onChange={vi.fn()}
      />,
    )
    expectResponsiveFields(container.firstElementChild as HTMLElement, [
      'Chi nhánh',
      'Nhà kho',
      'Kỹ thuật viên',
      'Mục đích',
      'Số phiếu cấp',
      'Số phiếu SC',
      'Mã sản phẩm',
      'Tên NSX',
      'Từ ngày',
      'Đến ngày',
    ])
    expect(screen.getByLabelText('Số phiếu cấp')).toHaveValue('CLK-001')
  })

  it('keeps the exact Cấp linh kiện purpose options', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CapLinhKienFilters filters={{}} onChange={vi.fn()} />)

    await user.click(screen.getByLabelText('Mục đích'))

    expect(
      screen
        .getAllByRole('option')
        .slice(1)
        .map((option) => option.textContent),
    ).toEqual(['Sữa chữa dịch vụ', 'Bảo hành', 'Kỹ thuật mượn'])
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
