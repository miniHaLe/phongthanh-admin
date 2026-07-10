/**
 * Kỳ (period) pickers over the Phase 1 Kỳ entity. `KyPicker` is a single select
 * labeled "Kỳ"; `KyRangePicker` is a "Từ Kỳ" / "Đến Kỳ" pair. Options are the
 * "M/YYYY" periods in descending order (newest first).
 */
import { useId } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KY } from '@/mock/seed/ky'

/** Kỳ options newest-first, as shown in the picker ("M/YYYY"). */
export const KY_OPTIONS = [...KY].reverse()
const KY_DESC = KY_OPTIONS

interface KyPickerProps {
  value?: string
  onChange: (kyId: string) => void
  label?: string
  className?: string
}

export function KyPicker({
  value,
  onChange,
  label = 'Kỳ',
  className,
}: KyPickerProps) {
  const id = useId()
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="mt-1 h-9">
          <SelectValue placeholder="Chọn kỳ" />
        </SelectTrigger>
        <SelectContent>
          {KY_DESC.map((k) => (
            <SelectItem key={k.id} value={k.id}>
              {k.ten}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface KyRangePickerProps {
  fromValue?: string
  toValue?: string
  onFromChange: (kyId: string) => void
  onToChange: (kyId: string) => void
  className?: string
}

export function KyRangePicker({
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  className,
}: KyRangePickerProps) {
  return (
    <div className={className} style={{ display: 'flex', gap: 12 }}>
      <KyPicker label="Từ Kỳ" value={fromValue} onChange={onFromChange} />
      <KyPicker label="Đến Kỳ" value={toValue} onChange={onToChange} />
    </div>
  )
}
