/**
 * DashboardSkeleton — animate-pulse layout mirror of DashboardPage.
 * Shown while critical queries are loading.
 */

import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Greeting banner skeleton */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Tile row: 4 tiles + today receipts */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Middle row: chart + low stock side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      {/* Branch counts + recent tickets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="col-span-2 h-40 rounded-xl" />
      </div>

      {/* Recent tickets table */}
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
