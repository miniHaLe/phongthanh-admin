/**
 * StockFilterBar — shared filter bar for inventory pages.
 * Filters: branch, period, nhóm hàng hoá, kho.
 * Mobile: collapses to "Bộ lọc ▾" button revealing a Sheet.
 */
import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PeriodRangePicker } from './period-range-picker'
import { BRANCHES } from '@/mock/seed/branches'
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import type { DateRange } from '@/hooks/use-finance-kpi'

const NHOM_HANG_OPTIONS = [
  { value: 'all', label: 'Tất cả nhóm' },
  { value: 'Pin', label: 'Pin' },
  { value: 'Màn hình', label: 'Màn hình' },
  { value: 'Camera', label: 'Camera' },
  { value: 'Bo mạch', label: 'Bo mạch' },
  { value: 'Linh kiện khác', label: 'Linh kiện khác' },
]

export interface StockFilters {
  period: DateRange | null
  branchId: string | null
  khoId: string | null
  nhomHang: string | null
}

interface StockFilterBarProps {
  value: StockFilters
  onChange: (filters: StockFilters) => void
}

function FilterFields({
  value,
  onChange,
}: {
  value: StockFilters
  onChange: (f: StockFilters) => void
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <PeriodRangePicker
        value={value.period}
        onChange={(period) => onChange({ ...value, period })}
      />

      <Select
        value={value.branchId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, branchId: v === 'all' ? null : v })
        }
      >
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Chi nhánh" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả chi nhánh</SelectItem>
          {BRANCHES.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.khoId ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, khoId: v === 'all' ? null : v })
        }
      >
        <SelectTrigger className="h-8 w-[200px] text-sm">
          <SelectValue placeholder="Kho" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả kho</SelectItem>
          {NHA_KHO_ROWS.map((k) => (
            <SelectItem key={k.id} value={k.id}>
              {k.tenNhaKho}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.nhomHang ?? 'all'}
        onValueChange={(v) =>
          onChange({ ...value, nhomHang: v === 'all' ? null : v })
        }
      >
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Nhóm hàng" />
        </SelectTrigger>
        <SelectContent>
          {NHOM_HANG_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(value.branchId || value.khoId || value.nhomHang) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-muted-foreground"
          onClick={() =>
            onChange({ ...value, branchId: null, khoId: null, nhomHang: null })
          }
        >
          <X className="h-3.5 w-3.5" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  )
}

export function StockFilterBar({ value, onChange }: StockFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <div className="mb-3 hidden md:block">
        <FilterFields value={value} onChange={onChange} />
      </div>

      {/* Mobile */}
      <div className="mb-3 md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Bộ lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>Bộ lọc tồn kho</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterFields
                value={value}
                onChange={(f) => {
                  onChange(f)
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
