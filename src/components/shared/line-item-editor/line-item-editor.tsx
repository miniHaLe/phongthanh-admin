/**
 * Generic full-page line-item editor template. Pages supply: a header-fields
 * slot (render prop), the line column config, and totals config. The action
 * footer always shows "Lưu" and "Lưu & Thêm mới". P5/P6 supply configs; this
 * template owns the layout + add/remove-row + totals mechanics.
 */
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface LineColumn<TLine> {
  key: string
  header: string
  /** Cell editor/renderer. `update` patches this line. */
  cell: (line: TLine, index: number, update: (patch: Partial<TLine>) => void) => React.ReactNode
}

export interface TotalDef<TLine> {
  key: string
  label: string
  compute: (lines: TLine[]) => React.ReactNode
}

export interface LineItemEditorProps<TLine> {
  header?: React.ReactNode
  columns: LineColumn<TLine>[]
  lines: TLine[]
  onLinesChange: (lines: TLine[]) => void
  makeEmptyLine: () => TLine
  totals?: TotalDef<TLine>[]
  onSave: (opts: { saveAndNew: boolean }) => void
  onBack?: () => void
  addRowLabel?: string
}

export function LineItemEditor<TLine>({
  header,
  columns,
  lines,
  onLinesChange,
  makeEmptyLine,
  totals,
  onSave,
  onBack,
  addRowLabel = 'Thêm dòng',
}: LineItemEditorProps<TLine>) {
  const [saving, setSaving] = useState(false)

  function addRow() {
    onLinesChange([...lines, makeEmptyLine()])
  }
  function removeRow(index: number) {
    onLinesChange(lines.filter((_, i) => i !== index))
  }
  function updateRow(index: number, patch: Partial<TLine>) {
    onLinesChange(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function handleSave(saveAndNew: boolean) {
    setSaving(true)
    try {
      onSave({ saveAndNew })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {header && <div className="rounded-lg border bg-card p-4">{header}</div>}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.header}</TableHead>
              ))}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    {c.cell(line, i, (patch) => updateRow(i, patch))}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Xóa dòng"
                    onClick={() => removeRow(i)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {totals && totals.length > 0 && (
            <TableFooter>
              {totals.map((t) => (
                <TableRow key={t.key}>
                  <TableCell colSpan={columns.length}>{t.label}</TableCell>
                  <TableCell>{t.compute(lines)}</TableCell>
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>

        <div className="border-t p-3">
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1.5 size-4" />
            {addRowLabel}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Quay lại
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => handleSave(true)}
        >
          Lưu & Thêm mới
        </Button>
        <Button type="button" disabled={saving} onClick={() => handleSave(false)}>
          Lưu
        </Button>
      </div>
    </div>
  )
}
