/**
 * "Lịch sử máy" — prior repairs sharing the same serial. Shared between the
 * detail page (always visible for the current ticket's serial) and the
 * create form (loaded on serial focusout) — kept standalone with a simple
 * prop API rather than a shared layer, since it only has these two consumers.
 */
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared'
import { fetchSerialHistory } from '@/domains/repair/mock-data'
import { formatDateTime } from '@/lib/format'
import { labelOf } from '@/domains/repair/status'

const HEADERS = [
  'Số phiếu',
  'Ngày nhận',
  'Tình trạng',
  'Mô tả hư hỏng',
  'Kỹ thuật',
] as const

export interface SerialHistoryPanelProps {
  serial: string
  /** Ticket id to exclude from the results (the current ticket itself). */
  excludeId?: string
}

export function SerialHistoryPanel({
  serial,
  excludeId,
}: SerialHistoryPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['serial-history', serial, excludeId],
    queryFn: () => fetchSerialHistory(serial, excludeId),
    enabled: !!serial,
  })

  const entries = data ?? []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lịch sử máy</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-2 text-sm text-muted-foreground">Đang tải…</p>
        ) : entries.length === 0 ? (
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
              {entries.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.soPhieu}</TableCell>
                  <TableCell>{formatDateTime(t.ngayNhan)}</TableCell>
                  <TableCell>{labelOf(t.tinhTrang)}</TableCell>
                  <TableCell>{t.moTaLoi}</TableCell>
                  <TableCell>{t.kyThuat}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
