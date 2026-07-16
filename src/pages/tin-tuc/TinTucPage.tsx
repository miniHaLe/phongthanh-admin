import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DataTable, notify, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createTinTuc,
  listTinTuc,
  TIN_TUC_QUERY_KEY,
  type TinTuc,
} from '@/api/tin-tuc-api'
import { ROUTES } from '@/constants/routes'
import { formatDateTime } from '@/lib/format'
import { CreateNewsDialog } from './create-news-dialog'

export default function TinTucPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const newsQuery = useQuery({
    queryKey: [...TIN_TUC_QUERY_KEY, 'list', query],
    queryFn: () => listTinTuc(query),
    placeholderData: keepPreviousData,
  })

  const createMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createTinTuc({ title, body: content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TIN_TUC_QUERY_KEY })
      notify.success('Thêm tin nhắn thành công')
    },
    onError: (error) => {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm tin nhắn',
      )
    },
  })

  const columns = useMemo<ColumnDef<TinTuc, unknown>[]>(
    () => [
      { id: 'title', accessorKey: 'title', header: 'Tiêu Đề' },
      { id: 'body', accessorKey: 'body', header: 'Nội Dung' },
      {
        id: 'createdAt',
        header: 'Ngày Tạo',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Chọn',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Xem ${row.original.title}`}
            onClick={() => navigate(ROUTES.newsDetail(row.original.id))}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div>
      <PageHeader
        title="Tin nhắn"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Tin nhắn' },
        ]}
      >
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Thêm tin nhắn
        </Button>
      </PageHeader>

      <div className="space-y-3 p-4 lg:p-6">
        <Input
          type="search"
          aria-label="Tìm kiếm"
          placeholder="Tên tin nhắn"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="max-w-md"
        />

        <DataTable
          tableId="tin-tuc"
          columns={columns}
          data={newsQuery.data?.data ?? []}
          isLoading={newsQuery.isLoading}
          isFetching={newsQuery.isFetching}
          isError={newsQuery.isError}
          onRetry={() => void newsQuery.refetch()}
          getRowId={(row) => row.id}
          emptyMessage="Không có tin nhắn"
        />
      </div>

      <CreateNewsDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={createMutation.isPending}
        onCreate={(title, content) =>
          createMutation.mutateAsync({ title, content }).then(() => undefined)
        }
      />
    </div>
  )
}
