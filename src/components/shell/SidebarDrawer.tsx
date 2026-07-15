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
import { BranchSwitcher } from '@/components/shared/branch-switcher'
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
        className="w-[min(18rem,calc(100vw-2rem))] bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="gap-3 border-b border-sidebar-border px-4 py-3 text-left">
          <SheetTitle className="text-base font-bold text-primary">
            Phong Thành
          </SheetTitle>
          <BranchSwitcher className="h-11 w-full bg-background text-foreground" />
        </SheetHeader>

        <ScrollArea className="h-[calc(100dvh-7.75rem)] flex-1 py-2">
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
