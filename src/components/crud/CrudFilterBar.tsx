/**
 * Collapsible filter bar driven by FilterConfig[].
 * Shows active-filter count badge when collapsed.
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import type { FilterConfig } from '@/types/crud-types'
import { useLoadedOptions } from '@/hooks/use-lookup'

interface CrudFilterBarProps<T> {
  filters: FilterConfig<T>[]
  value: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
  onClear: () => void
}

function LoadedFilterSelect<T>({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig<T>
  value: string
  onChange: (value: string) => void
}) {
  const { options, isLoading, error } = useLoadedOptions(
    filter.loadOptions,
    filter.options,
  )

  return (
    <div className="space-y-1">
      <Label className="text-xs">{filter.label}</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading && options.length === 0}
      >
        <SelectTrigger className="h-8 text-sm" aria-busy={isLoading}>
          <SelectValue
            placeholder={isLoading ? 'Đang tải…' : `Tất cả ${filter.label}`}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Tất cả</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive">
          Không tải được danh sách
          {filter.options?.length ? '; đang dùng dữ liệu có sẵn.' : '.'}
        </p>
      )}
    </div>
  )
}

export function CrudFilterBar<T>({
  filters,
  value,
  onChange,
  onClear,
}: CrudFilterBarProps<T>) {
  const [open, setOpen] = useState(false)

  const activeCount = Object.values(value).filter(
    (v) => v !== undefined && v !== '' && v !== null,
  ).length

  function handleChange(key: string, val: unknown) {
    onChange({ ...value, [key]: val })
  }

  if (!filters.length) return null

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Bộ lọc
          {!open && activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {activeCount}
            </Badge>
          )}
        </button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1 text-xs"
            onClick={onClear}
          >
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Filter fields */}
      {open && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filters.map((f) => {
            const k = String(f.key)
            const v = (value[k] as string) ?? ''

            if (f.type === 'select') {
              return (
                <LoadedFilterSelect
                  key={k}
                  filter={f}
                  value={v}
                  onChange={(val) =>
                    handleChange(k, val === '__all__' ? '' : val)
                  }
                />
              )
            }

            // text (date-range simplified to text for prototype)
            return (
              <div key={k} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  value={v}
                  onChange={(e) => handleChange(k, e.target.value)}
                  placeholder={f.label}
                  className="h-8 text-sm"
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
