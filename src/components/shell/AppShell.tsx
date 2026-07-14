import { Suspense, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { Sidebar } from './Sidebar'
import { SidebarDrawer } from './SidebarDrawer'
import { TopBar } from './TopBar'
import { AppFooter } from './AppFooter'
import { BranchMapModal, useBranchMapStore } from './BranchMapModal'
import { useRegisterCommands } from './command-registry'
import { useCallCenterDemo, triggerDemoCall } from '@/demo/call-center-demo'
import { buildShellCommands } from './navigation-command-utils'

function PageSpinner() {
  return (
    <div className="flex min-h-[60dvh] flex-1 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AppShell() {
  const navigate = useNavigate()
  const openBranchMap = useBranchMapStore((s) => s.openModal)
  useCallCenterDemo()

  const shellCommands = useMemo(
    () =>
      buildShellCommands(import.meta.env.DEV, openBranchMap, () =>
        triggerDemoCall(navigate),
      ),
    [navigate, openBranchMap],
  )
  useRegisterCommands('shell', shellCommands)

  return (
    <div className="flex min-h-dvh overflow-x-hidden bg-background">
      <Sidebar />
      <SidebarDrawer />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
        <AppFooter />
      </div>

      <CommandPalette />
      <BranchMapModal />
    </div>
  )
}
