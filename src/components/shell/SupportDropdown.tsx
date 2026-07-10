/**
 * Support dropdown (help icon) — panel titled "Thông tin liên hệ hỗ trợ:" with
 * placeholder contact lines (reference body was empty at capture time).
 */
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SupportDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Hỗ trợ">
          <HelpCircle className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-semibold">
          Thông tin liên hệ hỗ trợ:
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1 px-2 py-1.5 text-sm text-muted-foreground">
          <p>Hotline: 1900 0000</p>
          <p>Email: hotro@phongthanh.vn</p>
          <p>Giờ làm việc: 8:00 – 17:30 (T2–T7)</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
