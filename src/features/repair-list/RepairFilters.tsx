/**
 * Quick-filter strip for the repair list: Số phiếu search, single-select status,
 * date range, and a collapsible advanced panel with the reference field set.
 */
import { useId, useRef, useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SavedViews } from '@/components/shared'
import { cn } from '@/lib/utils'
import {
  REPAIR_STATUS_DISPLAY_ORDER,
  STATUS_LABEL,
  STATUS_HEX,
} from '@/domains/repair/status'
import type { RepairListFilters } from '@/domains/repair/types'
import { RepairFiltersAdvanced } from './RepairFiltersAdvanced'

interface RepairFiltersProps {
  filters: RepairListFilters
  activeFilterCount: number
  onChange: (next: Partial<RepairListFilters>) => void
  onClear: () => void
}

const STATUS_UNSET = '__all__'

export function RepairFilters({
  filters,
  activeFilterCount,
  onChange,
  onClear,
}: RepairFiltersProps) {
  const uid = useId()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const soPhieuRef = useRef<HTMLInputElement>(null)

  // Autofocus Số phiếu on mount (reference behavior).
  useEffect(() => {
    soPhieuRef.current?.focus()
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {/* Số phiếu (autofocus) */}
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${uid}-sophieu`} className="sr-only">
            Số phiếu
          </Label>
          <Input
            id={`${uid}-sophieu`}
            ref={soPhieuRef}
            className="h-8 w-44 text-sm"
            placeholder="Số phiếu…"
            value={filters.soPhieu ?? ''}
            onChange={(e) => onChange({ soPhieu: e.target.value || undefined })}
            aria-label="Số phiếu"
          />
        </div>

        {/* Single-select status */}
        <Select
          value={filters.tinhTrang != null ? String(filters.tinhTrang) : STATUS_UNSET}
          onValueChange={(v) =>
            onChange({
              tinhTrang:
                v === STATUS_UNSET
                  ? undefined
                  : (Number(v) as RepairListFilters['tinhTrang']),
            })
          }
        >
          <SelectTrigger className="h-8 w-48 text-sm" aria-label="Tình trạng">
            <SelectValue placeholder="Tình trạng…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_UNSET}>Tất cả tình trạng</SelectItem>
            {REPAIR_STATUS_DISPLAY_ORDER.map((id) => (
              <SelectItem key={id} value={String(id)}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: STATUS_HEX[id] }}
                  />
                  {STATUS_LABEL[id]}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            className="h-8 w-36 text-sm"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
            aria-label="Từ ngày"
          />
          <span className="text-muted-foreground" aria-hidden="true">
            –
          </span>
          <Input
            type="date"
            className="h-8 w-36 text-sm"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
            aria-label="Đến ngày"
          />
        </div>

        <div className="flex-1" />

        <SavedViews
          tableId="repair-list"
          currentFilters={filters as Record<string, unknown>}
          onApply={(f) => onChange(f as Partial<RepairListFilters>)}
        />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-muted-foreground"
          onClick={onClear}
          disabled={activeFilterCount === 0}
          aria-label="Xóa tất cả bộ lọc"
        >
          <X className="h-3.5 w-3.5" />
          Xóa lọc
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-5 min-w-[20px] px-1.5 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setAdvancedOpen((p) => !p)}
          aria-expanded={advancedOpen}
          aria-controls={`${uid}-advanced`}
        >
          Bộ lọc nâng cao
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              advancedOpen && 'rotate-180',
            )}
          />
        </Button>
      </div>

      <div
        id={`${uid}-advanced`}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          advancedOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0',
        )}
        aria-hidden={!advancedOpen}
      >
        <div className="border-t border-border px-4 pb-4 pt-3">
          <RepairFiltersAdvanced filters={filters} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
