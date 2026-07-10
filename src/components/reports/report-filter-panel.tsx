/**
 * Generic filter panel wrapper for the 6 repair reports (Phase 7 — owned exclusively).
 * Wraps arbitrary filter fields with a "Tìm kiếm" + "Xuất Excel ▾" action bar.
 * Keyboard: Enter in any field triggers submit.
 */
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react'
import { ExportExcelMenu } from './export-excel-menu'
import type { ExportGroup } from '@/mock/reports/report-types'
import { cn } from '@/lib/utils'

interface ReportFilterPanelProps {
  /** Filter field slots rendered inside the panel. */
  children: ReactNode
  /** Called when "Tìm kiếm" is clicked (form submits via parent RHF). */
  onSubmit: () => void
  isLoading: boolean
  exportGroups: ExportGroup[]
  className?: string
}

export function ReportFilterPanel({
  children,
  onSubmit,
  isLoading,
  exportGroups,
  className,
}: ReportFilterPanelProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      {/* Filter fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>

      {/* Action bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isLoading}
          className="gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          {isLoading ? 'Đang tải…' : 'Tìm kiếm'}
        </Button>

        <ExportExcelMenu groups={exportGroups} />
      </div>
    </div>
  )
}
