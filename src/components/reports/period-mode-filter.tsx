/**
 * Day/Month/Year tri-mode period filter (Phase 7 — owned exclusively).
 * Lifted out of KpiReportFilterForm (R8) so R3/R4/R5 share one implementation.
 * All three fieldsets render simultaneously (reference parity) — the radio at
 * the top of each fieldset selects which one is active; inactive fieldsets'
 * inputs are disabled (not unmounted) so stale values never submit.
 * Reads/writes fields via the surrounding react-hook-form context, so the
 * consumer's Zod schema must include: tuNgay, denNgay, nam, tuThang, denThang,
 * tuNam, denNam (all optional — only the active mode's fields are required).
 */
import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PeriodMode } from '@/mock/reports/report-types'

interface PeriodModeFilterProps {
  mode: PeriodMode
  onModeChange: (mode: PeriodMode) => void
  className?: string
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function PeriodModeFilter({
  mode,
  onModeChange,
  className,
}: PeriodModeFilterProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared across differently-shaped filter schemas that all include the period fields
  const form = useFormContext<any>()
  const currentYear = new Date().getFullYear()

  return (
    <RadioGroup
      value={mode}
      onValueChange={(v) => onModeChange(v as PeriodMode)}
      className={cn('grid grid-cols-1 gap-4 lg:grid-cols-3', className)}
    >
      {/* Xem theo ngày */}
      <fieldset
        className={cn(
          'rounded-md border p-3 transition-opacity',
          mode !== 'ngay' && 'opacity-60',
        )}
      >
        <legend className="flex items-center gap-2 px-1 text-sm font-medium">
          <RadioGroupItem value="ngay" id="period-mode-ngay" />
          <Label htmlFor="period-mode-ngay" className="cursor-pointer">
            Xem theo ngày
          </Label>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="tuNgay"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Từ ngày</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={mode !== 'ngay'}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="denNgay"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Đến ngày</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={mode !== 'ngay'}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>

      {/* Xem theo tháng */}
      <fieldset
        className={cn(
          'rounded-md border p-3 transition-opacity',
          mode !== 'thang' && 'opacity-60',
        )}
      >
        <legend className="flex items-center gap-2 px-1 text-sm font-medium">
          <RadioGroupItem value="thang" id="period-mode-thang" />
          <Label htmlFor="period-mode-thang" className="cursor-pointer">
            Xem theo tháng
          </Label>
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="nam"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Năm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    disabled={mode !== 'thang'}
                    {...field}
                    value={field.value ?? currentYear}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tuThang"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Từ tháng</FormLabel>
                <Select
                  disabled={mode !== 'thang'}
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value ?? 1)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        Tháng {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="denThang"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Đến tháng</FormLabel>
                <Select
                  disabled={mode !== 'thang'}
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value ?? 12)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        Tháng {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>

      {/* Xem theo năm */}
      <fieldset
        className={cn(
          'rounded-md border p-3 transition-opacity',
          mode !== 'nam' && 'opacity-60',
        )}
      >
        <legend className="flex items-center gap-2 px-1 text-sm font-medium">
          <RadioGroupItem value="nam" id="period-mode-nam" />
          <Label htmlFor="period-mode-nam" className="cursor-pointer">
            Xem theo năm
          </Label>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="tuNam"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Từ năm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    disabled={mode !== 'nam'}
                    {...field}
                    value={field.value ?? currentYear - 1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="denNam"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Đến năm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    disabled={mode !== 'nam'}
                    {...field}
                    value={field.value ?? currentYear}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>
    </RadioGroup>
  )
}
