/**
 * KPI Kỹ thuật report filter form (Phase 7 — owned exclusively).
 * Chi nhánh + Kỹ thuật multi-select + Nhóm sản phẩm multi-select + shared
 * Day/Month/Year tri-mode (PeriodModeFilter, R8). RHF + Zod validation.
 *
 * `KpiMultiSelect` is exported so KpiTiepNhanReportPage (R5 — same layout,
 * different person pool) can reuse it without a new shared file.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronDown } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react'
import { BRANCHES } from '@/mock/seed/branches'
import { PeriodModeFilter } from '@/components/reports/period-mode-filter'
import { ExportExcelMenu } from '@/components/reports/export-excel-menu'
import { exportToXlsx, type ExportColumn } from '@/lib/export-xlsx'
import {
  KPI_TECHNICIAN_OPTIONS,
  KPI_NHOM_SAN_PHAM_OPTIONS,
  type KpiPersonOption,
} from '@/mock/reports/kpi-mock'
import type { KpiFilterParams, PeriodMode } from '@/mock/reports/report-types'
import type { KpiAgingRow } from '@/domains/reports/aging-buckets'

// ── Reusable multi-select combobox (checkbox popover — R4/R5 shared) ────────

export interface KpiMultiSelectProps {
  ariaLabel: string
  options: KpiPersonOption[]
  value: string[]
  onChange: (ids: string[]) => void
  selectAllLabel: string
}

export function KpiMultiSelect({
  ariaLabel,
  options,
  value,
  onChange,
  selectAllLabel,
}: KpiMultiSelectProps) {
  const allSelected = value.length === 0 || value.length === options.length

  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    )
  }

  function toggleAll() {
    onChange(allSelected ? [] : options.map((o) => o.id))
  }

  const selectedLabels = options
    .filter((o) => value.includes(o.id))
    .map((o) => o.label)
  const triggerText = allSelected ? selectAllLabel : selectedLabels.join(', ')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label={ariaLabel}
          className="h-9 w-full justify-between font-normal"
        >
          <span className="truncate text-left">{triggerText}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <ul className="max-h-72 space-y-1 overflow-auto">
          <li>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm font-medium hover:bg-accent">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span className="flex-1">{selectAllLabel}</span>
              {allSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </label>
          </li>
          {options.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent">
                <Checkbox
                  checked={allSelected || value.includes(opt.id)}
                  onCheckedChange={() => toggle(opt.id)}
                />
                <span className="flex-1">{opt.label}</span>
                {(allSelected || value.includes(opt.id)) && (
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

// ── Flat Zod schema (all mode-specific fields optional; superRefine validates) ──

const kpiFilterSchema = z
  .object({
    mode: z.enum(['ngay', 'thang', 'nam']),
    chiNhanh: z.string().default('all'),
    personIds: z.array(z.string()).default([]),
    nhomSanPhamIds: z.array(z.string()).default([]),
    // ngay fields
    tuNgay: z.string().optional(),
    denNgay: z.string().optional(),
    // thang fields
    nam: z.coerce.number().int().min(2000).max(2100).optional(),
    tuThang: z.coerce.number().int().min(1).max(12).optional(),
    denThang: z.coerce.number().int().min(1).max(12).optional(),
    // nam fields
    tuNam: z.coerce.number().int().min(2000).max(2100).optional(),
    denNam: z.coerce.number().int().min(2000).max(2100).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.mode === 'ngay') {
      if (!d.tuNgay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn ngày bắt đầu',
          path: ['tuNgay'],
        })
      }
      if (!d.denNgay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn ngày kết thúc',
          path: ['denNgay'],
        })
      }
      if (d.tuNgay && d.denNgay && new Date(d.denNgay) < new Date(d.tuNgay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đến ngày phải ≥ Từ ngày',
          path: ['denNgay'],
        })
      }
    }
    if (d.mode === 'thang') {
      if (d.tuThang && d.denThang && d.denThang < d.tuThang) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đến tháng phải ≥ Từ tháng',
          path: ['denThang'],
        })
      }
    }
    if (d.mode === 'nam') {
      if (d.tuNam && d.denNam && d.denNam < d.tuNam) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đến năm phải ≥ Từ năm',
          path: ['denNam'],
        })
      }
    }
  })

type KpiFormValues = z.infer<typeof kpiFilterSchema>

// ── Default values ────────────────────────────────────────────────────────────

function getDefaultValuesForDate(today: Date): KpiFormValues {
  const from = new Date(today)
  from.setDate(from.getDate() - 30)
  const currentYear = today.getFullYear()
  return {
    mode: 'ngay',
    chiNhanh: 'all',
    personIds: [],
    nhomSanPhamIds: [],
    tuNgay: from.toISOString().slice(0, 10),
    denNgay: today.toISOString().slice(0, 10),
    nam: currentYear,
    tuThang: 1,
    denThang: 12,
    tuNam: currentYear - 1,
    denNam: currentYear,
  }
}

function getDefaultValues(): KpiFormValues {
  return getDefaultValuesForDate(new Date())
}

// ── KPI export groups (3 items: File, Lương, 1 Ngày) ─────────────────────────

const KPI_EXPORT_BUCKET_COLUMNS: readonly ExportColumn<KpiAgingRow>[] = [
  { header: '1 ngày', accessor: (row) => row.day1 },
  { header: '2 ngày', accessor: (row) => row.day2 },
  { header: '3 ngày', accessor: (row) => row.day3 },
  { header: '4 ngày', accessor: (row) => row.day4 },
  { header: '5 ngày', accessor: (row) => row.day5 },
  { header: '6 ngày', accessor: (row) => row.day6 },
  { header: '7 ngày', accessor: (row) => row.day7 },
  { header: '>7 ngày', accessor: (row) => row.over7 },
  { header: 'Tổng', accessor: (row) => row.total },
]

function kpiExportColumns(
  personLabel: string,
  rows: readonly KpiAgingRow[],
): ExportColumn<KpiAgingRow>[] {
  return [
    { header: 'STT', accessor: (row) => rows.indexOf(row) + 1 },
    { header: personLabel, accessor: (row) => row.personName },
    ...KPI_EXPORT_BUCKET_COLUMNS,
  ]
}

function buildKpiExportGroups(
  rows: readonly KpiAgingRow[],
  personLabel: string,
  reportKind: 'technician' | 'receiver',
) {
  const columns = kpiExportColumns(personLabel, rows)
  const mainExport = {
    label: 'Xuất Excel File',
    onExport: () =>
      void exportToXlsx({
        filename:
          reportKind === 'technician'
            ? 'kpi-bao-cao.xlsx'
            : 'kpi-tiep-nhan-bao-cao.xlsx',
        sheetName:
          reportKind === 'technician' ? 'Báo Cáo KPI' : 'KPI Tiếp Nhận',
        columns,
        rows: [...rows],
      }),
  }

  return [
    {
      label: 'File báo cáo',
      items:
        reportKind === 'receiver'
          ? [mainExport]
          : [
              mainExport,
              {
                label: 'Xuất Excel Luong',
                disabledWhen: true,
                disabledTooltip: 'Chưa xác minh cấu trúc workbook legacy',
                onExport: () => undefined,
              },
              {
                label: 'Xuất Excel 1 Ngày',
                disabledWhen: true,
                disabledTooltip: 'Chưa xác minh cấu trúc workbook legacy',
                onExport: () => undefined,
              },
            ],
    },
  ]
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface KpiReportFilterFormProps {
  onSubmit: (params: KpiFilterParams) => void
  isLoading: boolean
  exportRows?: readonly KpiAgingRow[]
  personLabel?: 'Kỹ thuật' | 'Tiếp tân'
  personOptions?: KpiPersonOption[]
  selectAllLabel?: string
  reportKind?: 'technician' | 'receiver'
  referenceDate?: Date
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KpiReportFilterForm({
  onSubmit,
  isLoading,
  exportRows = [],
  personLabel = 'Kỹ thuật',
  personOptions = KPI_TECHNICIAN_OPTIONS,
  selectAllLabel = 'Tất cả kỹ thuật',
  reportKind = 'technician',
  referenceDate,
}: KpiReportFilterFormProps) {
  // Local mode state drives radio + conditional rendering; kept in sync with form field
  const [mode, setMode] = useState<PeriodMode>('ngay')

  const form = useForm<KpiFormValues>({
    resolver: zodResolver(kpiFilterSchema),
    defaultValues: referenceDate
      ? getDefaultValuesForDate(referenceDate)
      : getDefaultValues(),
    mode: 'onSubmit',
  })

  function handleModeChange(next: PeriodMode) {
    setMode(next)
    form.setValue('mode', next)
    form.clearErrors()
  }

  function handleSubmit(values: KpiFormValues) {
    const base: KpiFilterParams = {
      mode: values.mode as PeriodMode,
      chiNhanh: values.chiNhanh,
      personIds: values.personIds,
      nhomSanPhamIds: values.nhomSanPhamIds,
    }
    if (values.mode === 'ngay') {
      base.tuNgay = values.tuNgay
      base.denNgay = values.denNgay
    } else if (values.mode === 'thang') {
      base.nam = values.nam
      base.tuThang = values.tuThang
      base.denThang = values.denThang
    } else {
      base.tuNam = values.tuNam
      base.denNam = values.denNam
    }
    onSubmit(base)
  }

  const exportGroups = buildKpiExportGroups(
    exportRows,
    personLabel,
    reportKind,
  )

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void form.handleSubmit(handleSubmit)()
            }
          }}
        >
          {/* ── Shared header fields ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="chiNhanh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi nhánh</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả chi nhánh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
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
              name="personIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{personLabel}</FormLabel>
                  <FormControl>
                    <KpiMultiSelect
                      ariaLabel={personLabel}
                      options={personOptions}
                      value={field.value}
                      onChange={field.onChange}
                      selectAllLabel={selectAllLabel}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nhomSanPhamIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm sản phẩm</FormLabel>
                  <FormControl>
                    <KpiMultiSelect
                      ariaLabel="Nhóm sản phẩm"
                      options={KPI_NHOM_SAN_PHAM_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      selectAllLabel="Tất cả nhóm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Period mode (shared R8 component) ─────────────────────────── */}
          <div className="mt-4">
            <PeriodModeFilter mode={mode} onModeChange={handleModeChange} />
          </div>

          {/* ── Action bar ────────────────────────────────────────────────── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {isLoading ? 'Đang tải…' : 'Tìm kiếm'}
            </Button>
            <ExportExcelMenu groups={exportGroups} />
          </div>
        </form>
      </Form>
    </div>
  )
}
