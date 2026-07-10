/**
 * "Xuất Excel ▾" grouped dropdown menu (Phase 7 — owned exclusively).
 * Always visible regardless of result state. Mock download creates a CSV Blob
 * served via URL.createObjectURL + success toast.
 *
 * Also exports `mockCsvDownload` so report-configs can reference it without
 * creating a circular dependency through the component tree.
 */
import { useState } from 'react'
import { ChevronDown, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { notify } from '@/components/shared'
import { neutralizeCell } from '@/lib/export-xlsx'
import type { ExportGroup } from '@/mock/reports/report-types'

// ── Mock download helper (exported for use in configs) ─────────────────────────

/** Wrap a CSV field: neutralize formula-injection, then quote + escape quotes. */
function csvField(value: string | number): string {
  const safe = neutralizeCell(value)
  return `"${String(safe).replace(/"/g, '""')}"`
}

/**
 * Creates a minimal CSV Blob and triggers a browser download.
 * Every field is run through the hardened `neutralizeCell` (F8/C3) so a
 * formula-leading string cannot inject into the produced spreadsheet.
 * The toast sequence: "Đang xuất file…" → 1s → "Xuất thành công".
 */
export function mockCsvDownload(filename: string, title: string): void {
  const toastId = notify.loading('Đang xuất file…')
  void toastId // dismiss handled by sonner's auto-dismiss

  setTimeout(() => {
    // Build a minimal header-only CSV — every field neutralized + quoted.
    const csv =
      `${csvField(title)}\n` +
      `${csvField(`Dữ liệu xuất lúc: ${new Date().toLocaleString('vi-VN')}`)}\n`
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify.success('Xuất thành công')
  }, 1000)
}

/** Exposed for tests: build the neutralized CSV body for a title. */
export function buildReportCsv(title: string): string {
  return (
    `${csvField(title)}\n` +
    `${csvField('Dữ liệu xuất lúc: —')}\n`
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ExportExcelMenuProps {
  groups: ExportGroup[]
  /** Passed from KPI page to disable "Xuất Excel 1 Ngày" when mode ≠ ngay */
  disabled?: boolean
}

export function ExportExcelMenu({ groups }: ExportExcelMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <FileSpreadsheet className="size-4" aria-hidden="true" />
          Xuất Excel
          <ChevronDown
            className="size-3.5 transition-transform duration-150"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {groups.map((group, gi) => (
          <DropdownMenuGroup key={gi}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {group.label}
            </DropdownMenuLabel>

            {group.items.map((item, ii) => {
              if (item.disabledWhen) {
                return (
                  <TooltipProvider key={ii} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* Wrapper needed so Tooltip fires on a disabled element */}
                        <span className="block">
                          <DropdownMenuItem
                            disabled
                            className="cursor-not-allowed opacity-50"
                          >
                            {item.label}
                          </DropdownMenuItem>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        className="max-w-[200px] text-xs"
                      >
                        {item.disabledTooltip ?? 'Không khả dụng'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              }

              return (
                <DropdownMenuItem
                  key={ii}
                  onSelect={() => {
                    setOpen(false)
                    item.onExport()
                  }}
                >
                  {item.label}
                </DropdownMenuItem>
              )
            })}

            {gi < groups.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
