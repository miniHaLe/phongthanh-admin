import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface DataTablePaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  pageSizeOptions?: number[]
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

/**
 * Renders pagination controls: range summary (left), page-size selector +
 * prev/next buttons + page indicator (right). `page` is 1-based.
 */
export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-muted-foreground">
      {/* Left: row-range summary */}
      <span className="whitespace-nowrap">
        Hiển thị {from}–{to} / {total}
      </span>

      {/* Right: page-size selector + navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap">Hàng mỗi trang:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v))
            // Reset to page 1 when page-size changes so the cursor stays valid.
            onPageChange(1)
          }}
        >
          <SelectTrigger className="h-11 w-[78px] md:h-8 md:w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 md:h-8 md:w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="whitespace-nowrap">
          Trang {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 md:h-8 md:w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          aria-label="Trang tiếp theo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
