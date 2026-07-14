import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RowSelectionState } from '@tanstack/react-table'
import type { KhachHang } from '@/types/masterdata-types'
import { CustomerMobileCards } from './customer-mobile-cards'

const customer: KhachHang = {
  id: 'kh-mobile-1',
  tenKH: 'Nguyễn Minh Mobile',
  dienThoai: '0905000000',
  dienThoai2: '0905000001',
  diaChi: '12 Lê Duẩn, Đắk Lắk',
  loaiKhachHangId: 1,
  nguoiTao: 'admin',
  active: true,
  createdAt: '2026-07-14T00:00:00.000Z',
}

function Harness({ onEdit }: { onEdit: (row: KhachHang) => void }) {
  const [selection, setSelection] = useState<RowSelectionState>({})
  return (
    <CustomerMobileCards
      customers={[customer]}
      rowSelection={selection}
      onSelectionChange={setSelection}
      onEdit={onEdit}
    />
  )
}

describe('CustomerMobileCards', () => {
  it('renders accessible identity, address, selection, and edit actions', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<Harness onEdit={onEdit} />)

    const list = screen.getByRole('region', { name: 'Danh sách khách hàng' })
    const card = within(list).getByRole('article', {
      name: customer.tenKH,
    })
    expect(card).toHaveTextContent(customer.dienThoai)
    expect(card).toHaveTextContent(customer.dienThoai2!)
    expect(card).toHaveTextContent(customer.diaChi!)

    const checkbox = within(card).getByRole('checkbox', {
      name: `Chọn khách hàng ${customer.tenKH}`,
    })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(
      within(card).getByRole('button', {
        name: `Chỉnh sửa khách hàng ${customer.tenKH}`,
      }),
    )
    expect(onEdit).toHaveBeenCalledWith(customer)
  })
})
