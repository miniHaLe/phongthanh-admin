import { Suspense, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Loader2, Map, PhoneIncoming } from 'lucide-react'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { Sidebar } from './Sidebar'
import { SidebarDrawer } from './SidebarDrawer'
import { TopBar } from './TopBar'
import { AppFooter } from './AppFooter'
import { BranchMapModal, useBranchMapStore } from './BranchMapModal'
import { useRegisterCommands } from './command-registry'
import { useCallCenterDemo, triggerDemoCall } from '@/demo/call-center-demo'

function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AppShell() {
  const navigate = useNavigate()
  const openBranchMap = useBranchMapStore((s) => s.openModal)
  useCallCenterDemo()

  const shellCommands = useMemo(
    () => [
      {
        id: 'shell-branch-map',
        label: 'Bản đồ chi nhánh',
        group: 'Hành động nhanh',
        icon: Map,
        run: openBranchMap,
      },
      {
        id: 'shell-demo-call',
        label: 'Demo: Cuộc gọi đến',
        group: 'Demo',
        icon: PhoneIncoming,
        run: () => triggerDemoCall(navigate),
      },
    ],
    [navigate, openBranchMap],
  )
  useRegisterCommands('shell', shellCommands)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <SidebarDrawer />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
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
