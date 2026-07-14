import { Map, PanelsTopLeft, PhoneIncoming } from 'lucide-react'
import { NAV_DESTINATIONS } from '@/config/nav-config'
import { ROUTES } from '@/constants/routes'
import type { CommandAction } from './command-registry'

export function filterPaletteDynamicActions(
  actions: CommandAction[],
): CommandAction[] {
  return actions.filter(
    (action) => !action.id.startsWith('nav-') && action.group !== 'Điều hướng',
  )
}

export function getPaletteNavigationItems(dev: boolean) {
  return [
    ...NAV_DESTINATIONS,
    ...(dev
      ? [
          {
            id: 'dev-gallery',
            label: 'Mở Gallery',
            path: ROUTES.gallery,
            icon: PanelsTopLeft,
            keywords: ['gallery', 'component', 'ui', 'dev'],
          },
        ]
      : []),
  ]
}

export function buildShellCommands(
  dev: boolean,
  openBranchMap: () => void,
  triggerCall: () => void,
): CommandAction[] {
  return [
    {
      id: 'shell-branch-map',
      label: 'Bản đồ chi nhánh',
      group: 'Hành động nhanh',
      icon: Map,
      run: openBranchMap,
    },
    ...(dev
      ? [
          {
            id: 'shell-demo-call',
            label: 'Demo: Cuộc gọi đến',
            group: 'Demo',
            icon: PhoneIncoming,
            run: triggerCall,
          },
        ]
      : []),
  ]
}

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

export function isNavItemActive(pathname: string, itemPath: string): boolean {
  const current = normalizePath(pathname)
  const target = normalizePath(itemPath)
  return current === target || current.startsWith(`${target}/`)
}
