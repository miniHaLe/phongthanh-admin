import { useNavigate } from 'react-router-dom'
import { KeyRound, LogOut, UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/routes'
import { CURRENT_USER } from '@/mock/current-user-mock'

export function UserMenu() {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Menu tài khoản"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              PT
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{CURRENT_USER.hoVaTen}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {CURRENT_USER.quyen} · {CURRENT_USER.dienThoai}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate(ROUTES.account)}>
          <UserCircle className="mr-2 size-4" />
          Thông tin tài khoản
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate(ROUTES.changePassword)}>
          <KeyRound className="mr-2 size-4" />
          Đổi mật khẩu
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate(ROUTES.login)}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
