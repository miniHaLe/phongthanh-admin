/**
 * Quick-filter strip for the repair list: Số phiếu search, single-select status,
 * date range, and a collapsible advanced panel with the reference field set.
 */
import { useId, useRef, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterPanel, SavedViews } from '@/components/shared'
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
  onSearch: () => void
  onReload: () => void
}

const STATUS_UNSET = '__all__'

export function RepairFilters({
  filters,
  activeFilterCount,
  onChange,
  onClear,
  onSearch,
  onReload,
}: RepairFiltersProps) {
  const uid = useId()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const soPhieuRef = useRef<HTMLInputElement>(null)

  // Autofocus Số phiếu on mount (reference behavior).
  useEffect(() => {
    soPhieuRef.current?.focus()
  }, [])

  return (
    <div data-repair-filters="">
      <FilterPanel
        filterCount={activeFilterCount}
        onClear={onClear}
        onSearch={onSearch}
        defaultExpanded
        contentClassName="block space-y-3"
        savedViewsSlot={
          <SavedViews
            tableId="repair-list"
            currentFilters={filters as Record<string, unknown>}
            onApply={(next) => onChange(next as Partial<RepairListFilters>)}
          />
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          {/* Số phiếu (autofocus) */}
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor={`${uid}-sophieu`} className="sr-only">
              Số phiếu
            </Label>
            <Input
              id={`${uid}-sophieu`}
              ref={soPhieuRef}
              className="h-11 w-full text-base md:h-8 md:text-sm lg:w-44"
              placeholder="Số phiếu…"
              value={filters.soPhieu ?? ''}
              onChange={(e) =>
                onChange({ soPhieu: e.target.value || undefined })
              }
              aria-label="Số phiếu"
            />
          </div>

          {/* Single-select status */}
          <Select
            value={
              filters.tinhTrang != null
                ? String(filters.tinhTrang)
                : STATUS_UNSET
            }
            onValueChange={(v) =>
              onChange({
                tinhTrang:
                  v === STATUS_UNSET
                    ? undefined
                    : (Number(v) as RepairListFilters['tinhTrang']),
              })
            }
          >
            <SelectTrigger
              className="h-11 w-full text-base md:h-8 md:text-sm lg:w-48"
              aria-label="Tình trạng"
            >
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
          <div
            data-repair-date-range
            className="grid grid-cols-1 items-center gap-1.5 sm:col-span-2 md:grid-cols-[1fr_auto_1fr] lg:flex lg:flex-none"
          >
            <Input
              type="date"
              className="h-11 w-full text-base md:h-8 md:text-sm lg:w-40 lg:shrink-0"
              value={filters.dateFrom ?? ''}
              onChange={(e) =>
                onChange({ dateFrom: e.target.value || undefined })
              }
              aria-label="Từ ngày"
            />
            <span
              className="hidden text-muted-foreground md:block"
              aria-hidden="true"
            >
              –
            </span>
            <Input
              type="date"
              className="h-11 w-full text-base md:h-8 md:text-sm lg:w-40 lg:shrink-0"
              value={filters.dateTo ?? ''}
              onChange={(e) =>
                onChange({ dateTo: e.target.value || undefined })
              }
              aria-label="Đến ngày"
            />
          </div>

          <div className="hidden flex-1 lg:block" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11 gap-1.5 md:h-8"
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

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11 md:h-8"
            onClick={onReload}
          >
            Tải lại trang
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
          <div className="border-t border-border pt-3">
            <RepairFiltersAdvanced filters={filters} onChange={onChange} />
          </div>
        </div>
      </FilterPanel>
    </div>
  )
}
