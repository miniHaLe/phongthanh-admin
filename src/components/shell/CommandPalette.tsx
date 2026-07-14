import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCommandStore, useRegisteredCommands } from './command-registry'
import { useAppStore } from '@/store/app-store'
import {
  filterPaletteDynamicActions,
  getPaletteNavigationItems,
} from './navigation-command-utils'

/**
 * ⌘K / Ctrl+K command palette (C5). Lists all screens (from nav-config, which
 * sources ROUTES) + dynamically-registered quick actions from other phases.
 */
export function CommandPalette() {
  const navigate = useNavigate()
  const open = useCommandStore((s) => s.open)
  const setOpen = useCommandStore((s) => s.setOpen)
  const toggle = useCommandStore((s) => s.toggle)
  const dynamicActions = filterPaletteDynamicActions(useRegisteredCommands())
  const navigationItems = getPaletteNavigationItems(import.meta.env.DEV)
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [toggle])

  const runAndClose = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  // Group dynamic actions by their `group` label.
  const grouped = dynamicActions.reduce<Record<string, typeof dynamicActions>>(
    (acc, a) => {
      const key = a.group ?? 'Hành động nhanh'
      ;(acc[key] ??= []).push(a)
      return acc
    },
    {},
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Đi tới…" />
      <CommandList>
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

        <CommandGroup heading="Màn hình">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.keywords.join(' ')}`}
              onSelect={() => runAndClose(() => navigate(item.path))}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {Object.entries(grouped).map(([heading, actions]) => (
          <CommandGroup key={heading} heading={heading}>
            {actions.map((a) => (
              <CommandItem
                key={a.id}
                value={`${a.label} ${a.keywords?.join(' ') ?? ''}`}
                onSelect={() => runAndClose(a.run)}
              >
                {a.icon && <a.icon className="mr-2 size-4" />}
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Giao diện">
          <CommandItem
            value="doi giao dien theme sang toi"
            onSelect={() =>
              runAndClose(() => setTheme(theme === 'dark' ? 'light' : 'dark'))
            }
          >
            Đổi giao diện sáng/tối
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
