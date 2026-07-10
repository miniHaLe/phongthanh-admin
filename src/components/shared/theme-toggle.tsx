import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAppStore, type Theme } from '@/store/app-store'
import { cn } from '@/lib/utils'

const THEME_CYCLE: Theme[] = ['light', 'dark', 'system']

const THEME_LABEL: Record<Theme, string> = {
  light: 'Giao diện sáng',
  dark: 'Giao diện tối',
  system: 'Theo hệ thống',
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'light') return <Sun className="h-4 w-4" />
  if (theme === 'dark') return <Moon className="h-4 w-4" />
  return <Monitor className="h-4 w-4" />
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  function handleClick() {
    const idx = THEME_CYCLE.indexOf(theme)
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    setTheme(next)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            aria-label={THEME_LABEL[theme]}
            className={cn(className)}
          >
            <ThemeIcon theme={theme} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{THEME_LABEL[theme]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
