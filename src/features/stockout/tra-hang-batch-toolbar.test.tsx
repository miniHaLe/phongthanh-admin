import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReturnSlip } from '@/domains/warehouse/types'
import { TraHangBatchToolbar } from './tra-hang-batch-toolbar'

const exportListXlsx = vi.hoisted(() => vi.fn(async () => undefined))
vi.mock('@/lib/export-list-xlsx', () => ({ exportListXlsx }))

const row: ReturnSlip = {
  id: 'tra-1',
  soPhieu: 'TH-001',
  ngayTra: '2026-07-14',
  hinhThucTra: 'Trả hàng từ kỹ thuật',
  nguoiLap: 'admin',
  branchId: 'dak-lak',
}

describe('TraHangBatchToolbar exports', () => {
  it('keeps contextual labels and forwards the existing rows/contracts', async () => {
    const user = userEvent.setup()
    render(<TraHangBatchToolbar allRows={[row]} onSearch={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Xuất Excel' }))
    expect(exportListXlsx).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filename: 'tra-hang',
        sheetName: 'Trả Hàng',
        rows: [row],
      }),
    )

    await user.click(
      screen.getByRole('button', { name: 'Xuất Excel Chi Tiết' }),
    )
    expect(exportListXlsx).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filename: 'tra-hang-chi-tiet',
        sheetName: 'Trả Hàng Chi Tiết',
        rows: [row],
      }),
    )
  })
})
