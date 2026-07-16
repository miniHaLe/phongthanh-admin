import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import type { TinTuc } from '@/api/tin-tuc-api'
import { ROUTES } from '@/constants/routes'
import { renderWithProviders } from '@/test/render-with-providers'
import TinTucDetailPage from './TinTucDetailPage'

const apiMocks = vi.hoisted(() => ({ getTinTuc: vi.fn() }))

vi.mock('@/api/tin-tuc-api', () => ({
  TIN_TUC_QUERY_KEY: ['tin-tuc'],
  getTinTuc: apiMocks.getTinTuc,
}))

const item: TinTuc = {
  id: 'tin-detail',
  title: 'Lịch trực tháng 8',
  body: 'Nội dung lịch trực chi tiết.',
  author: 'admin',
  active: true,
  createdAt: '2026-07-15T09:00:00.000Z',
}

function renderDetail(id: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/tin-tuc/:id" element={<TinTucDetailPage />} />
    </Routes>,
    { route: ROUTES.newsDetail(id) },
  )
}

describe('TinTucDetailPage', () => {
  it('loads and renders the requested news item by id', async () => {
    apiMocks.getTinTuc.mockResolvedValueOnce(item)

    renderDetail(item.id)

    expect(await screen.findByText(item.body)).toBeInTheDocument()
    expect(apiMocks.getTinTuc).toHaveBeenCalledWith(item.id)
    expect(screen.getByRole('link', { name: /Danh sách/ })).toHaveAttribute(
      'href',
      ROUTES.news,
    )
  })

  it('shows the not-found state when the resource lookup fails', async () => {
    apiMocks.getTinTuc.mockRejectedValueOnce(new Error('Không tìm thấy'))

    renderDetail('missing')

    expect(
      await screen.findByText('Không tìm thấy tin nhắn'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Quay lại danh sách/ }),
    ).toHaveAttribute('href', ROUTES.news)
  })
})
