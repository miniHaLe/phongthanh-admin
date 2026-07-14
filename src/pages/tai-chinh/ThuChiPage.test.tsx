/** Spec: Chứng Từ grouped table + 12-type Loại + 5-state Tình trạng. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { THU_CHI_COLUMN_LABELS } from '@/config/finance-tables/thu-chi.config'
import ThuChiPage from './ThuChiPage'

describe('ThuChiPage', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999) // never trip the mock error gate
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes the exact 15 verified column labels, in order', () => {
    expect(THU_CHI_COLUMN_LABELS).toEqual([
      'Tình Trạng',
      'Số chứng từ',
      'Loại phiếu',
      'Hình thức',
      'Số Phiếu SC/NK',
      'Kỹ thuật',
      'Đại lý/Trạm',
      'Tên khách hàng',
      'Ngày lập',
      'Số tiền',
      'Nội dung',
      'Người tạo',
      'Người Thu/Chi',
      'Ngày Thu/Chi',
      'Chọn',
    ])
  })

  it('renders the grouped finance columns', async () => {
    renderWithProviders(<ThuChiPage />)
    const headerCells = await screen.findAllByRole('columnheader')
    const groupedHeaders = [
      '',
      'Trạng thái / Loại',
      'Tham chiếu chứng từ',
      'Đối tượng',
      'Số tiền',
      'Nội dung',
      'Tạo chứng từ',
      'Thu / Chi',
      'In',
    ]
    expect(headerCells).toHaveLength(groupedHeaders.length)
    groupedHeaders.forEach((label, i) => {
      expect(headerCells[i]).toHaveTextContent(label)
    })
  })

  it('renders the Lập Phiếu Thu and Lập Phiếu Chi header buttons', () => {
    renderWithProviders(<ThuChiPage />)
    expect(
      screen.getByRole('button', { name: 'Lập Phiếu Thu' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lập Phiếu Chi' }),
    ).toBeInTheDocument()
  })

  it('per-row action is print only (in phiếu) — no edit/delete icon', async () => {
    renderWithProviders(<ThuChiPage />)
    const printButtons = await screen.findAllByTitle('in phiếu')
    expect(printButtons.length).toBeGreaterThan(0)
    expect(screen.queryByTitle('Chỉnh sửa')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Xóa')).not.toBeInTheDocument()
  })

  it('renders 4 KPI boxes: Doanh thu, Phải thu, Chi phí, Phải trả', () => {
    renderWithProviders(<ThuChiPage />)
    expect(screen.getByText(/Doanh thu \/ Doanh thu ngoài/)).toBeInTheDocument()
    expect(screen.getByText('Phải thu')).toBeInTheDocument()
    expect(screen.getByText('Chi phí')).toBeInTheDocument()
    expect(screen.getByText('Phải trả')).toBeInTheDocument()
  })

  it('uses the standard list label while preserving the Thu SC suffix', () => {
    renderWithProviders(<ThuChiPage />)
    expect(
      screen.getByRole('button', { name: 'Xuất Excel' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xuất Excel Thu SC' }),
    ).toBeInTheDocument()
  })
})
