import { apiFor } from '@/api/api-for'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { BaseEntity, ListParams, PagedResult } from '@/mock/seed'

export interface TinTuc extends BaseEntity {
  title: string
  body: string
  author: string
}

export interface CreateTinTucInput {
  title: string
  body: string
}

export const TIN_TUC_QUERY_KEY = ['tin-tuc'] as const

export const TIN_TUC_MOCK_ROWS: TinTuc[] = [
  {
    id: 'news-001',
    title: 'Lịch trực trung tâm bảo hành',
    body: 'Cập nhật lịch trực và đầu mối tiếp nhận trong tuần.',
    author: CURRENT_USER.tenDangNhap,
    createdAt: '2026-07-14T08:00:00.000Z',
    active: true,
  },
  {
    id: 'news-002',
    title: 'Quy trình bàn giao linh kiện',
    body: 'Kiểm tra serial và ký nhận trước khi bàn giao linh kiện.',
    author: CURRENT_USER.tenDangNhap,
    createdAt: '2026-07-12T02:30:00.000Z',
    active: true,
  },
]

export const tinTucApi = apiFor('tin-tuc', TIN_TUC_MOCK_ROWS)

export function listTinTuc(search = ''): Promise<PagedResult<TinTuc>> {
  const params: ListParams = {
    page: 1,
    pageSize: 100,
    sort: 'createdAt',
    dir: 'desc',
    search: search.trim() || undefined,
  }
  return tinTucApi.list(params)
}

export function getTinTuc(id: string): Promise<TinTuc> {
  return tinTucApi.get(id)
}

export function createTinTuc(input: CreateTinTucInput): Promise<TinTuc> {
  return tinTucApi.create({
    title: input.title.trim(),
    body: input.body.trim(),
    author: CURRENT_USER.tenDangNhap,
    active: true,
  })
}
