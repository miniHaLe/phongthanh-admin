import { afterEach, describe, expect, it, vi } from 'vitest'

function customerDates(rows: Array<{ createdAt: string; updatedAt?: string }>) {
  return rows.map(({ createdAt, updatedAt }) => ({ createdAt, updatedAt }))
}

function employeeDates(
  rows: Array<{
    ngaySinh?: string
    ngayLamViec?: string
    ngayCap?: string
    createdAt: string
    updatedAt?: string
  }>,
) {
  return rows.map(
    ({ ngaySinh, ngayLamViec, ngayCap, createdAt, updatedAt }) => ({
      ngaySinh,
      ngayLamViec,
      ngayCap,
      createdAt,
      updatedAt,
    }),
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('masterdata timestamps', () => {
  it('stay identical across reloads under different wall clocks', async () => {
    vi.useFakeTimers()
    vi.setSystemTime('2020-01-01T00:00:00.000Z')
    const firstCustomers = await import('./khach-hang.mock')
    const firstEmployees = await import('./nhan-vien.mock')
    const customerSnapshot = customerDates(firstCustomers.KHACH_HANG_ROWS)
    const employeeSnapshot = employeeDates(firstEmployees.NHAN_VIEN_ROWS)

    vi.resetModules()
    vi.setSystemTime('2040-01-01T00:00:00.000Z')
    const secondCustomers = await import('./khach-hang.mock')
    const secondEmployees = await import('./nhan-vien.mock')

    expect(customerDates(secondCustomers.KHACH_HANG_ROWS)).toEqual(
      customerSnapshot,
    )
    expect(employeeDates(secondEmployees.NHAN_VIEN_ROWS)).toEqual(
      employeeSnapshot,
    )
  })
})
