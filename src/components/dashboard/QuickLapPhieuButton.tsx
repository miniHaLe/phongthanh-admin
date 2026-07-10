/**
 * QuickLapPhieuButton — "Lập phiếu" CTA.
 * Mobile: fixed bottom-right FAB (z-50).
 * md+: inline button (hidden FAB, shown inline via prop).
 */

import { PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface QuickLapPhieuButtonProps {
  /** When true renders as inline button (desktop header slot). FAB always rendered for mobile. */
  variant?: 'inline' | 'fab'
  className?: string
}

export function QuickLapPhieuButton({
  variant = 'fab',
  className,
}: QuickLapPhieuButtonProps) {
  const navigate = useNavigate()

  function handleClick() {
    navigate(ROUTES.repairCreate)
  }

  if (variant === 'inline') {
    return (
      <Button onClick={handleClick} className={cn('gap-1.5', className)}>
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        Lập phiếu
      </Button>
    )
  }

  // FAB — visible on mobile, hidden on md+ (inline button takes over)
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Lập phiếu mới"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden',
        className,
      )}
    >
      <PlusCircle className="h-5 w-5" aria-hidden="true" />
      Lập phiếu
    </button>
  )
}
