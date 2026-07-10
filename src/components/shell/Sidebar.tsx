import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'
import { PRIMARY_NAV, ADMIN_NAV } from '@/config/nav-config'
import { NavItem } from './NavItem'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col',
        'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        'transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-sidebar-border px-4 font-semibold',
          collapsed ? 'justify-center' : 'gap-2',
        )}
      >
        <span className="font-bold text-primary">
          {collapsed ? 'PT' : 'Phong Thành'}
        </span>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-2">
        <nav aria-label="Điều hướng chính" className="space-y-0.5 px-2">
          {PRIMARY_NAV.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}

          <Separator className="my-2" />

          {ADMIN_NAV.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          className="w-full hover:bg-sidebar-accent/10"
        >
          {collapsed ? (
            <PanelLeft className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>
      </div>
    </aside>
  )
}
