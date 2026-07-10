/**
 * PeriodRangePicker — shadcn Calendar-based date range picker.
 * Quick preset pills: Hôm nay, Tuần này, Tháng này, Quý này, Năm này.
 * Controlled via DateRange { from, to } ISO strings.
 */
import { useState } from 'react'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  formatISO,
  parseISO,
} from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { DateRange as DayPickerRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/hooks/use-finance-kpi'

interface PeriodRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange) => void
  className?: string
}

function toISO(d: Date, type: 'from' | 'to'): string {
  const ref = type === 'from' ? startOfDay(d) : endOfDay(d)
  return formatISO(ref, { representation: 'date' })
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  {
    label: 'Hôm nay',
    range: () => {
      const t = new Date()
      return { from: toISO(t, 'from'), to: toISO(t, 'to') }
    },
  },
  {
    label: 'Tuần này',
    range: () => ({
      from: toISO(startOfWeek(new Date(), { weekStartsOn: 1 }), 'from'),
      to: toISO(endOfWeek(new Date(), { weekStartsOn: 1 }), 'to'),
    }),
  },
  {
    label: 'Tháng này',
    range: () => ({
      from: toISO(startOfMonth(new Date()), 'from'),
      to: toISO(endOfMonth(new Date()), 'to'),
    }),
  },
  {
    label: 'Quý này',
    range: () => ({
      from: toISO(startOfQuarter(new Date()), 'from'),
      to: toISO(endOfQuarter(new Date()), 'to'),
    }),
  },
  {
    label: 'Năm này',
    range: () => ({
      from: toISO(startOfYear(new Date()), 'from'),
      to: toISO(endOfYear(new Date()), 'to'),
    }),
  },
]

export function PeriodRangePicker({
  value,
  onChange,
  className,
}: PeriodRangePickerProps) {
  const [open, setOpen] = useState(false)

  const selectedRange: DayPickerRange | undefined = value
    ? {
        from: parseISO(value.from),
        to: parseISO(value.to),
      }
    : undefined

  function handleSelect(range: DayPickerRange | undefined) {
    if (!range?.from) return
    const to = range.to ?? range.from
    onChange({ from: toISO(range.from, 'from'), to: toISO(to, 'to') })
    if (range.from && range.to) setOpen(false)
  }

  const displayLabel = value
    ? `${format(parseISO(value.from), 'dd/MM/yyyy')} – ${format(parseISO(value.to), 'dd/MM/yyyy')}`
    : 'Chọn kỳ'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 gap-1.5 text-sm', className)}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Preset pills */}
        <div className="flex flex-wrap gap-1.5 border-b p-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                onChange(p.range())
                setOpen(false)
              }}
              className="rounded-full border px-3 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={vi}
          captionLayout="label"
        />
      </PopoverContent>
    </Popover>
  )
}
