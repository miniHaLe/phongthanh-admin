import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSidebarStore } from '@/store/sidebar-store'
import { PRIMARY_NAV, ADMIN_NAV } from '@/config/nav-config'
import { NavItem } from './NavItem'

export function SidebarDrawer() {
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  function closeDrawer() {
    setMobileOpen(false)
  }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent
        side="left"
        className="w-72 bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="h-14 flex-row items-center border-b border-sidebar-border px-4">
          <SheetTitle className="text-base font-bold text-primary">
            Phong Thành
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-3.5rem)] flex-1 py-2">
          <nav aria-label="Điều hướng chính" className="space-y-0.5 px-2">
            {PRIMARY_NAV.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                collapsed={false}
                onClick={closeDrawer}
              />
            ))}

            <Separator className="my-2" />

            {ADMIN_NAV.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                collapsed={false}
                onClick={closeDrawer}
              />
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
