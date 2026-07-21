/**
 * Phase 4: the Thêm khu vực dialog renders the 6 legacy-parity fields on the
 * 2-level Tỉnh→Phường/Xã hierarchy, requires a commune, persists a real row via
 * khuVucConfig.mockApi.create, and the created row is immediately in KHU_VUC_ROWS.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'
import { KHU_VUC_ROWS } from '@/mock/masterdata/khu-vuc.mock'
import { QuickCreateKhuVuc } from './QuickCreateKhuVuc'

const fetchSnapshot = vi.hoisted(() => vi.fn())
vi.mock('@/api/vietnam-geography', () => ({
  fetchVietnamAdministrativeSnapshot: fetchSnapshot,
}))

const snapshot: VietnamAdministrativeSnapshot = {
  version: 'test',
  effectiveFrom: '2025-07-01',
  sourceDocument: 'test',
  provinces: [
    { code: '66', name: 'Tỉnh Đắk Lắk', type: 'province' },
    { code: '01', name: 'Thành phố Hà Nội', type: 'city' },
  ],
  communes: [
    {
      code: '66001',
      name: 'Tân Lập',
      type: 'Phường',
      normalizedName: 'tan lap',
      provinceCode: '66',
      provinceName: 'Tỉnh Đắk Lắk',
    },
    {
      code: '01001',
      name: 'Ba Đình',
      type: 'Phường',
      normalizedName: 'ba dinh',
      provinceCode: '01',
      provinceName: 'Thành phố Hà Nội',
    },
  ],
}

beforeEach(() => {
  fetchSnapshot.mockReset()
  fetchSnapshot.mockResolvedValue(snapshot)
})

describe('QuickCreateKhuVuc', () => {
  it('renders the 6 legacy-parity fields', async () => {
    renderWithProviders(<QuickCreateKhuVuc close={vi.fn()} select={vi.fn()} />)
    expect(screen.getByText('Tỉnh')).toBeInTheDocument()
    expect(screen.getByText('Phường/Xã')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên khu vực/)).toBeInTheDocument()
    expect(screen.getByLabelText('Cây số')).toBeInTheDocument()
    expect(screen.getByLabelText('Tiền công 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Tiền công 2')).toBeInTheDocument()
  })

  it('blocks save without a commune (commune required)', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    renderWithProviders(<QuickCreateKhuVuc close={vi.fn()} select={select} />)

    await user.type(screen.getByLabelText(/Tên khu vực/), 'KV Test')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(screen.getByText('Vui lòng chọn Phường/Xã.')).toBeInTheDocument()
    expect(select).not.toHaveBeenCalled()
  })

  it('persists a real khu vực row and selects it', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    const before = KHU_VUC_ROWS.length
    renderWithProviders(<QuickCreateKhuVuc close={vi.fn()} select={select} />)

    // Province select — open the trigger (id qc-kv-tinh) and pick Đắk Lắk.
    const provinceTrigger = document.getElementById('qc-kv-tinh')!
    await waitFor(() =>
      expect(fetchSnapshot).toHaveBeenCalled(),
    )
    await user.click(provinceTrigger)
    await user.click(await screen.findByRole('option', { name: 'Tỉnh Đắk Lắk' }))

    // Commune combobox (scoped to province 66)
    const communeInput = screen.getByPlaceholderText('Tìm phường/xã')
    await user.click(communeInput)
    await user.type(communeInput, 'Tân')
    await user.click(await screen.findByRole('option', { name: /Tân Lập/ }))

    await user.type(screen.getByLabelText(/Tên khu vực/), 'KV Đắk Lắk 1')
    await user.type(screen.getByLabelText('Cây số'), '12')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() =>
      expect(select).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'KV Đắk Lắk 1' }),
      ),
    )
    expect(KHU_VUC_ROWS.length).toBe(before + 1)
    const created = KHU_VUC_ROWS.find((r) => r.tenKhuVuc === 'KV Đắk Lắk 1')
    expect(created).toMatchObject({
      tinhCode: '66',
      phuongXaCode: '66001',
      caySo: 12,
    })
  })
})
