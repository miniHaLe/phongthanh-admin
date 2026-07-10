/**
 * WorkQueueTiles — 4-tile grid for the main repair-status KPI row.
 * Tiles map to the 4 legacy queue statuses: Mới Nhận (1), Đã Điều Phối (2),
 * Chờ Linh Kiện (7), Sửa Xong (9).
 */

import { Inbox, Send, PackageSearch, Wrench } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { WorkQueueTile } from './WorkQueueTile'
import { labelOf, type RepairStatusId } from '@/domains/repair/status'
import type { DashboardSummary, QueueCount } from '@/types/dashboard-types'

interface WorkQueueTilesProps {
  summary: DashboardSummary
}

interface TileConfig {
  status: RepairStatusId
  icon: typeof Inbox
  /** Tailwind classes for icon container bg + icon text color */
  colorClass: string
}

const TILE_CONFIGS: TileConfig[] = [
  {
    status: 1,
    icon: Inbox,
    colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  },
  {
    status: 2,
    icon: Send,
    colorClass:
      'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  },
  {
    status: 7,
    icon: PackageSearch,
    colorClass:
      'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  },
  {
    status: 9,
    icon: Wrench,
    colorClass:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
]

export function WorkQueueTiles({ summary }: WorkQueueTilesProps) {
  const countMap = new Map<RepairStatusId, QueueCount>(
    summary.queue.map((q) => [q.status, q]),
  )

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {TILE_CONFIGS.map((cfg) => {
        const qc = countMap.get(cfg.status)
        return (
          <WorkQueueTile
            key={cfg.status}
            label={labelOf(cfg.status)}
            count={qc?.count ?? 0}
            trend={qc?.trend ?? 0}
            icon={cfg.icon}
            colorClass={cfg.colorClass}
            href={`${ROUTES.repairList}?status=${cfg.status}`}
          />
        )
      })}
    </div>
  )
}
