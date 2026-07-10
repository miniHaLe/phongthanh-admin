/**
 * "Danh sách cấp linh kiện" — parts issued to the assigned technician. Row
 * actions open Trả linh kiện / Thu xác linh kiện.
 */
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared'
import { formatDateTime } from '@/lib/format'
import type { PartsIssueEntry } from '@/domains/repair/types'
import { TraLinhKienModal } from './TraLinhKienModal'
import { ThuXacLinhKienModal } from './ThuXacLinhKienModal'

const HEADERS = [
  'STT',
  'Linh kiện',
  'Số lượng',
  'Ngày cấp',
  'Người cấp',
  'Hành động',
] as const

export function PartsIssuedTable({ entries }: { entries: PartsIssueEntry[] }) {
  const [traTarget, setTraTarget] = useState<PartsIssueEntry | null>(null)
  const [thuXacTarget, setThuXacTarget] = useState<PartsIssueEntry | null>(
    null,
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Danh sách cấp linh kiện</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState heading="Không có dữ liệu" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {HEADERS.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={entry.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{entry.ten}</TableCell>
                  <TableCell>{entry.soLuong}</TableCell>
                  <TableCell>{formatDateTime(entry.ngayCap)}</TableCell>
                  <TableCell>{entry.nguoiCap}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTraTarget(entry)}
                      >
                        Trả linh kiện
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setThuXacTarget(entry)}
                      >
                        Thu xác linh kiện
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <TraLinhKienModal
        open={traTarget != null}
        onOpenChange={(open) => !open && setTraTarget(null)}
        part={traTarget}
      />
      <ThuXacLinhKienModal
        open={thuXacTarget != null}
        onOpenChange={(open) => !open && setThuXacTarget(null)}
        part={thuXacTarget}
      />
    </Card>
  )
}
