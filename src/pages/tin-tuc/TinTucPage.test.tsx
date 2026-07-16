/** Spec: legacy News_Index table, search, and persistent create flow. */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useParams } from 'react-router-dom'
import type { TinTuc } from '@/api/tin-tuc-api'
import { ROUTES } from '@/constants/routes'
import { renderWithProviders } from '@/test/render-with-providers'
import TinTucPage from './TinTucPage'

const apiMocks = vi.hoisted(() => ({
  listTinTuc: vi.fn(),
  createTinTuc: vi.fn(),
}))

vi.mock('@/api/tin-tuc-api', () => ({
  TIN_TUC_QUERY_KEY: ['tin-tuc'],
  listTinTuc: apiMocks.listTinTuc,
  createTinTuc: apiMocks.createTinTuc,
}))

const HEADERS_IN_ORDER = ['Tiêu Đề', 'Nội Dung', 'Ngày Tạo', 'Chọn']
const INITIAL_ROWS: TinTuc[] = [
  {
    id: 'tin-1',
    title: 'Lịch trực trung tâm bảo hành',
    body: 'Cập nhật lịch trực trong tuần.',
    author: 'admin',
    active: true,
    createdAt: '2026-07-14T08:00:00.000Z',
  },
  {
    id: 'tin-2',
    title: 'Quy trình bàn giao linh kiện',
    body: 'Kiểm tra serial trước khi bàn giao.',
    author: 'admin',
    active: true,
    createdAt: '2026-07-12T02:30:00.000Z',
  },
]

let rows: TinTuc[]

function DetailTarget() {
  const { id } = useParams<{ id: string }>()
  return <p>Chi tiết {id}</p>
}

describe('TinTucPage', () => {
  beforeEach(() => {
    rows = INITIAL_ROWS.map((row) => ({ ...row }))
    apiMocks.listTinTuc.mockReset().mockImplementation(async (search = '') => {
      const normalized = String(search).trim().toLocaleLowerCase('vi')
      const data = normalized
        ? rows.filter((item) =>
            `${item.title} ${item.body}`
              .toLocaleLowerCase('vi')
              .includes(normalized),
          )
        : rows
      return { data, total: data.length, page: 1, pageSize: 100 }
    })
    apiMocks.createTinTuc.mockReset().mockImplementation(async (input) => {
      const created: TinTuc = {
        id: 'tin-created',
        title: input.title,
        body: input.body,
        author: 'admin',
        active: true,
        createdAt: '2026-07-15T09:00:00.000Z',
      }
      rows = [created, ...rows]
      return created
    })
  })

  it('renders API rows with the exact legacy table columns in order', async () => {
    renderWithProviders(<TinTucPage />)

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent),
    ).toEqual(HEADERS_IN_ORDER)
    expect(await screen.findByText(INITIAL_ROWS[0].title)).toBeInTheDocument()
    expect(apiMocks.listTinTuc).toHaveBeenCalledWith('')
  })

  it('searches news by title through the resource list query', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TinTucPage />)
    await screen.findByText(INITIAL_ROWS[0].title)

    await user.type(
      screen.getByRole('searchbox', { name: 'Tìm kiếm' }),
      INITIAL_ROWS[0].title,
    )

    await waitFor(() => {
      expect(apiMocks.listTinTuc).toHaveBeenLastCalledWith(
        INITIAL_ROWS[0].title,
      )
    })
    expect(screen.getByText(INITIAL_ROWS[0].title)).toBeInTheDocument()
    expect(screen.queryByText(INITIAL_ROWS[1].title)).not.toBeInTheDocument()
  })

  it('posts a new item, invalidates the query, and re-lists it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TinTucPage />)
    await screen.findByText(INITIAL_ROWS[0].title)

    await user.click(screen.getByRole('button', { name: 'Thêm tin nhắn' }))
    await user.type(screen.getByLabelText('Tiêu đề'), 'Lịch bảo trì tháng 8')
    await user.type(
      screen.getByLabelText('Nội dung'),
      'Kiểm tra thiết bị trước ngày 01/08.',
    )
    await user.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => {
      expect(apiMocks.createTinTuc).toHaveBeenCalledWith({
        title: 'Lịch bảo trì tháng 8',
        body: 'Kiểm tra thiết bị trước ngày 01/08.',
      })
      expect(apiMocks.listTinTuc.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
    expect(await screen.findByText('Lịch bảo trì tháng 8')).toBeInTheDocument()
    expect(
      screen.getByText('Kiểm tra thiết bị trước ngày 01/08.'),
    ).toBeInTheDocument()
  })

  it('opens the selected item through the detail route', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/tin-tuc" element={<TinTucPage />} />
        <Route path="/tin-tuc/:id" element={<DetailTarget />} />
      </Routes>,
      { route: ROUTES.news },
    )
    await screen.findByText(INITIAL_ROWS[0].title)

    await user.click(
      screen.getByRole('button', { name: `Xem ${INITIAL_ROWS[0].title}` }),
    )

    expect(
      await screen.findByText(`Chi tiết ${INITIAL_ROWS[0].id}`),
    ).toBeInTheDocument()
  })
})
