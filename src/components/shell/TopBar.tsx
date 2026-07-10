import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle, BranchSwitcher } from '@/components/shared'
import { useSidebarStore } from '@/store/sidebar-store'
import { useCommandStore } from '@/components/shell/command-registry'
import { NotifBadge } from './NotifBadge'
import { NewsBadge } from './NewsBadge'
import { SupportDropdown } from './SupportDropdown'
import { UserMenu } from './UserMenu'

export function TopBar() {
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  function openCommandPalette() {
    useCommandStore.getState().setOpen(true)
  }

  return (
    <header
      data-app-topbar=""
      className="flex h-14 items-center gap-2 border-b bg-card px-4"
    >
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Mở menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Page-level breadcrumbs live in each page's PageHeader / section
          tab-strip — TopBar stays a thin global bar to avoid duplicate crumbs. */}

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1">
        {/* Search trigger — text variant for sm+, icon-only for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="flex sm:hidden"
          aria-label="Tìm kiếm"
          onClick={openCommandPalette}
        >
          <Search className="size-5" />
        </Button>

        <Button
          variant="ghost"
          className="hidden items-center gap-2 px-3 text-sm text-muted-foreground sm:flex"
          onClick={openCommandPalette}
        >
          <Search className="size-4" />
          <span>Tìm kiếm</span>
          <kbd className="pointer-events-none ml-1 inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        <NotifBadge />
        <NewsBadge />
        <SupportDropdown />
        <BranchSwitcher className="hidden w-44 lg:flex" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
