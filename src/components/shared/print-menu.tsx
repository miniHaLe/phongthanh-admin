import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface PrintMenuItem {
  label: string
  onSelect: () => void
}

export interface PrintMenuProps {
  items: PrintMenuItem[]
  disabled?: boolean
  label?: string
}

/**
 * Dropdown menu for print actions. Trigger shows a Printer icon and an
 * optional label (defaults to "In"). Each item calls its `onSelect` handler.
 */
export function PrintMenu({ items, disabled, label = 'In' }: PrintMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          disabled={disabled}
        >
          <Printer className="h-4 w-4" />
          <span>{label}</span>
          {/* Downward caret rendered as text to avoid an extra icon dep */}
          <span className="text-xs opacity-60">▾</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
