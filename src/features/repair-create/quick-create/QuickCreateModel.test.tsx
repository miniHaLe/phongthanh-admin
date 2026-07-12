import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render-with-providers'
import { QuickCreateModel } from './QuickCreateModel'

const mocks = vi.hoisted(() => ({
  createCatalogModel: vi.fn(),
  catalog: {
    manufacturers: [
      {
        id: 'brand-a',
        tenNSX: 'Hãng A',
        active: true,
        createdAt: '2026-01-01',
      },
    ],
    products: [
      {
        id: 'product-tv',
        tenSP: 'Tivi',
        nhomSanPhamId: 'group-1',
        active: true,
        createdAt: '2026-01-01',
      },
    ],
    models: [],
  },
}))

vi.mock('@/features/model/model-catalog-data', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/model/model-catalog-data')>()
  return {
    ...actual,
    loadModelCatalog: vi.fn().mockResolvedValue(mocks.catalog),
    createCatalogModel: mocks.createCatalogModel,
  }
})

describe('QuickCreateModel', () => {
  it('renders exactly the four approved model fields', async () => {
    renderWithProviders(<QuickCreateModel close={vi.fn()} select={vi.fn()} />)

    expect(screen.getByText(/Tên Sản Phẩm/)).toBeInTheDocument()
    expect(screen.getByText(/Nhà sản xuất/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tên model/)).toBeInTheDocument()
    expect(screen.getByLabelText('Ghi chú')).toBeInTheDocument()
    expect(screen.queryByText('Model Code')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeEnabled(),
    )
  })

  it('persists with prefilled parents and selects the returned model', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    mocks.createCatalogModel.mockResolvedValueOnce({
      id: 'model-new',
      tenModel: 'Series X',
      nhaSanXuatId: 'brand-a',
      sanPhamId: 'product-tv',
      nguoiTao: 'Tester',
      active: true,
      createdAt: '2026-07-11',
    })
    renderWithProviders(
      <QuickCreateModel
        close={vi.fn()}
        select={select}
        initialNhaSanXuatId="brand-a"
        initialSanPhamId="product-tv"
      />,
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Lưu' })).toBeEnabled(),
    )
    await user.type(screen.getByLabelText(/Tên model/), 'Series X')
    await user.type(screen.getByLabelText('Ghi chú'), 'Model mới')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(mocks.createCatalogModel).toHaveBeenCalledWith({
      sanPhamId: 'product-tv',
      nhaSanXuatId: 'brand-a',
      tenModel: 'Series X',
      ghiChu: 'Model mới',
    })
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'model-new',
        nhaSanXuatId: 'brand-a',
        sanPhamId: 'product-tv',
      }),
    )
  })
})
