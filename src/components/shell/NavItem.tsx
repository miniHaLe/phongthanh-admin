import { NavLink } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { NavItem as NavItemType } from '@/config/nav-config'

interface NavItemProps {
  item: NavItemType
  collapsed: boolean
  onClick?: () => void
}

export function NavItem({ item, collapsed, onClick }: NavItemProps) {
  const Icon = item.icon

  const linkContent = (isActive: boolean) => (
    <span
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        'hover:bg-sidebar-accent/10',
        isActive
          ? 'border-l-2 border-sidebar-accent bg-sidebar-accent/25 font-medium'
          : 'border-l-2 border-transparent',
        collapsed && 'justify-center px-2',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </span>
  )

  const navLink = (
    <NavLink
      to={item.path}
      end={item.path === ROUTES.home}
      aria-label={collapsed ? item.label : undefined}
      onClick={onClick}
      className="block"
    >
      {({ isActive }) => linkContent(isActive)}
    </NavLink>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{navLink}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return navLink
}
