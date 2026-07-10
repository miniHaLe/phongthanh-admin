/**
 * GreetingBanner — time-aware Vietnamese greeting + branch badge.
 * Greeting is derived at render time (runtime date, not seeded random).
 */

import { branchLabel } from '@/mock/seed/branches'
import type { ActiveBranch } from '@/store/app-store'
import { cn } from '@/lib/utils'

interface GreetingBannerProps {
  activeBranch: ActiveBranch
  className?: string
}

function deriveGreeting(hour: number): string {
  if (hour >= 0 && hour < 12) return 'Chào buổi sáng'
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

const USER_DISPLAY_NAME = 'Nguyễn Quản Trị'

export function GreetingBanner({
  activeBranch,
  className,
}: GreetingBannerProps) {
  const hour = new Date().getHours()
  const greeting = deriveGreeting(hour)
  const branch = branchLabel(activeBranch)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h2 className="truncate text-xl font-semibold">{USER_DISPLAY_NAME}</h2>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <span
          className="h-1.5 w-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
        {branch}
      </span>
    </div>
  )
}
