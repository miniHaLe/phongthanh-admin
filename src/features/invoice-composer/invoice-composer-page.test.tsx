/** Spec: Invoice composer — VAT rate default 10 derives Tiền thuế; source-import Loại options. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { LOAI_PHIEU_THU_OPTIONS } from './source-ticket-search'
import InvoiceComposerPage from './invoice-composer-page'

describe('InvoiceComposerPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the toolbar actions and both fieldsets', () => {
    renderWithProviders(<InvoiceComposerPage />)
    expect(screen.getByRole('button', { name: 'In Hóa Đơn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Danh sách hóa đơn' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu & Thêm mới' })).toBeInTheDocument()
    expect(screen.getByText('Thông tin khách hàng')).toBeInTheDocument()
    expect(screen.getByText('Chi tiết')).toBeInTheDocument()
  })

  it('VAT rate defaults to 10 and Tiền thuế is 0 with no lines', () => {
    renderWithProviders(<InvoiceComposerPage />)
    const vatInput = screen.getByLabelText('VAT (%)') as HTMLInputElement
    expect(vatInput.value).toBe('10')
    expect(screen.getByText(/Tiền thuế:/).parentElement).toHaveTextContent('0 ₫')
  })

  it('adding a line with Thành tiền 100 derives Tiền thuế 10 (10% of subtotal)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InvoiceComposerPage />)

    await user.click(screen.getByRole('button', { name: /Thêm dòng/ }))
    const donGiaInputs = screen.getAllByLabelText(/Đơn giá dòng/)
    await user.clear(donGiaInputs[0])
    await user.type(donGiaInputs[0], '100')

    expect(screen.getByText(/Tổng thành tiền:/).parentElement).toHaveTextContent('100 ₫')
    expect(screen.getByText(/Tiền thuế:/).parentElement).toHaveTextContent('10 ₫')
    expect(screen.getByText(/Tổng thanh toán:/).parentElement).toHaveTextContent('110 ₫')
  })

  it('source-ticket import Loại phiếu thu options are exactly Bán hàng/Phiếu sửa chữa/Nội dung khác', () => {
    expect(LOAI_PHIEU_THU_OPTIONS).toEqual(['Bán hàng', 'Phiếu sửa chữa', 'Nội dung khác'])
  })
})
