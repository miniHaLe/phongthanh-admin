/**
 * BranchCountsTable — 3-col mini table: Chi nhánh | Đang mở | Quá hạn.
 * No pagination needed (2 branches in mock).
 */

import type { BranchCount } from '@/types/dashboard-types'

interface BranchCountsTableProps {
  branches: BranchCount[]
}

export function BranchCountsTable({ branches }: BranchCountsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
              Chi nhánh
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Đang mở
            </th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">
              Quá hạn
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {branches.map((b) => (
            <tr
              key={b.branchId}
              className="transition-colors hover:bg-muted/30"
            >
              <td className="px-3 py-2.5 font-medium">{b.branchName}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {b.openCount}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {b.overdueCount > 0 ? (
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {b.overdueCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
