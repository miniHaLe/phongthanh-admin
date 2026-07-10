/**
 * Phụ cấp multi-select — checkbox list in a popover (no dedicated MultiSelect
 * primitive exists in the shared UI kit yet, so this is a small local
 * composition of Popover + Checkbox rather than a new shared component for a
 * single consumer).
 */
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PHU_CAP_ROWS } from '@/domains/hr/phu-cap.mock'

interface PhuCapMultiSelectProps {
  value: string[]
  onChange: (ids: string[]) => void
}

export function PhuCapMultiSelect({ value, onChange }: PhuCapMultiSelectProps) {
  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    )
  }

  const selectedLabels = PHU_CAP_ROWS.filter((p) => value.includes(p.id)).map(
    (p) => p.tenPhuCap,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Phụ cấp"
          className="h-9 w-full justify-between font-normal"
        >
          <span className="truncate text-left">
            {selectedLabels.length > 0
              ? selectedLabels.join(', ')
              : 'Chọn các phụ cấp'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <ul className="max-h-60 space-y-1 overflow-auto">
          {PHU_CAP_ROWS.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
                <Checkbox
                  checked={value.includes(p.id)}
                  onCheckedChange={() => toggle(p.id)}
                />
                <span className="flex-1">{p.tenPhuCap}</span>
                {value.includes(p.id) && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </label>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
