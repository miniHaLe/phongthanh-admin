/**
 * Spec: StatusLogTable / DispatchLogTable render the exact legacy header sets
 * and fall back to "Không có dữ liệu" when there are no entries.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { StatusLogTable, STATUS_LOG_HEADERS } from './StatusLogTable'
import { DispatchLogTable, DISPATCH_LOG_HEADERS } from './DispatchLogTable'
import type {
  StatusHistoryEntry,
  DispatchLogEntry,
} from '@/domains/repair/types'

const statusEntry: StatusHistoryEntry = {
  status: 4,
  changedAt: '2024-01-01T00:00:00.000Z',
  changedBy: 'Kỹ thuật A',
  gia: 200000,
  noiDungSC: 'Thay board mạch',
  note: 'Đã báo giá',
}

const dispatchEntry: DispatchLogEntry = {
  kyThuat: 'Kỹ thuật A',
  ngayTao: '2024-01-01T00:00:00.000Z',
  nguoiTao: 'Nhân viên B',
  tienCong: 100000,
  tinhTrang: 2,
}

describe('StatusLogTable', () => {
  it('renders the exact header set', () => {
    render(<StatusLogTable entries={[statusEntry]} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([...STATUS_LOG_HEADERS])
  })

  it('renders row data (Giá, Nội dung SC, Ghi chú)', () => {
    render(<StatusLogTable entries={[statusEntry]} />)
    expect(screen.getByText('200.000 ₫')).toBeInTheDocument()
    expect(screen.getByText('Thay board mạch')).toBeInTheDocument()
    expect(screen.getByText('Đã báo giá')).toBeInTheDocument()
  })

  it('shows the shared empty state when there is no history', () => {
    render(<StatusLogTable entries={[]} />)
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })
})

describe('DispatchLogTable', () => {
  it('renders the exact header set', () => {
    render(<DispatchLogTable entries={[dispatchEntry]} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent)).toEqual([...DISPATCH_LOG_HEADERS])
  })

  it('renders row data', () => {
    render(<DispatchLogTable entries={[dispatchEntry]} />)
    expect(screen.getByText('Kỹ thuật A')).toBeInTheDocument()
    expect(screen.getByText('100.000 ₫')).toBeInTheDocument()
  })

  it('omits the labor-cost column on the edit page variant', () => {
    render(<DispatchLogTable entries={[dispatchEntry]} showLaborCost={false} />)
    expect(
      screen.getAllByRole('columnheader').map((h) => h.textContent),
    ).toEqual([
      'STT',
      'Kỹ thuật',
      'Ngày tạo',
      'Người tạo',
      'Tình trạng',
      'Ngày hủy',
      'Người hủy',
    ])
    expect(screen.queryByText('100.000 ₫')).not.toBeInTheDocument()
  })

  it('shows the shared empty state when there is no dispatch log', () => {
    const { container } = render(<DispatchLogTable entries={[]} />)
    expect(within(container).getByText('Không có dữ liệu')).toBeInTheDocument()
  })
})
