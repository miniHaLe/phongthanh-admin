import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportListXlsx } from './export-list-xlsx'

const exportToXlsx = vi.hoisted(() => vi.fn())
const notify = vi.hoisted(() => ({
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('./export-xlsx', () => ({ exportToXlsx }))
vi.mock('@/components/shared/toast', () => ({ notify }))

const options = {
  filename: 'danh-sach',
  sheetName: 'Danh Sách',
  columns: [{ header: 'Tên', accessor: (row: { name: string }) => row.name }],
  rows: [{ name: 'An' }, { name: 'Bình' }],
}

describe('exportListXlsx', () => {
  beforeEach(() => {
    exportToXlsx.mockReset()
    notify.info.mockReset()
    notify.success.mockReset()
    notify.error.mockReset()
  })

  it('forwards the existing export contract and emits one success lifecycle', async () => {
    exportToXlsx.mockResolvedValue(undefined)

    await exportListXlsx(options)

    expect(exportToXlsx).toHaveBeenCalledOnce()
    expect(exportToXlsx).toHaveBeenCalledWith(options)
    expect(notify.info).toHaveBeenCalledOnce()
    expect(notify.info).toHaveBeenCalledWith('Đang xuất 2 dòng…')
    expect(notify.success).toHaveBeenCalledOnce()
    expect(notify.success).toHaveBeenCalledWith('Đã xuất Excel')
    expect(notify.error).not.toHaveBeenCalled()
  })

  it('emits one error lifecycle without a false success', async () => {
    exportToXlsx.mockRejectedValue(new Error('write failed'))

    await exportListXlsx(options)

    expect(notify.info).toHaveBeenCalledOnce()
    expect(notify.success).not.toHaveBeenCalled()
    expect(notify.error).toHaveBeenCalledOnce()
    expect(notify.error).toHaveBeenCalledWith(
      'Không thể xuất Excel. Vui lòng thử lại.',
    )
  })
})
