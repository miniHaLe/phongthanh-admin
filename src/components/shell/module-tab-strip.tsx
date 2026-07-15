import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ModuleTab {
  label: string
  path: string
}

interface ModuleTabStripProps {
  tabs: readonly ModuleTab[]
  ariaLabel: string
}

interface ScrollState {
  hasOverflow: boolean
  canScrollLeft: boolean
  canScrollRight: boolean
}

const LONG_TAB_SET_SIZE = 7

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function isTabActive(pathname: string, tabPath: string): boolean {
  const current = normalizePath(pathname)
  const target = normalizePath(tabPath)
  return current === target || current.startsWith(`${target}/`)
}

export function ModuleTabStrip({ tabs, ariaLabel }: ModuleTabStripProps) {
  const { pathname } = useLocation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLongSet = tabs.length >= LONG_TAB_SET_SIZE
  const [scrollState, setScrollState] = useState<ScrollState>({
    hasOverflow: isLongSet,
    canScrollLeft: false,
    canScrollRight: isLongSet,
  })

  const activePath = useMemo(
    () =>
      tabs
        .filter((tab) => isTabActive(pathname, tab.path))
        .sort((left, right) => right.path.length - left.path.length)[0]?.path,
    [pathname, tabs],
  )

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (!element) return
    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth)
    setScrollState({
      hasOverflow: maxScrollLeft > 1,
      canScrollLeft: element.scrollLeft > 1,
      canScrollRight: element.scrollLeft < maxScrollLeft - 1,
    })
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    updateScrollState()
    const frame = window.requestAnimationFrame(updateScrollState)
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateScrollState)
        : null

    observer?.observe(element)
    if (element.firstElementChild) observer?.observe(element.firstElementChild)
    window.addEventListener('resize', updateScrollState)

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [tabs, updateScrollState])

  useEffect(() => {
    const activeTab = scrollRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    )
    activeTab?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [activePath])

  const showOverflowControls = isLongSet || scrollState.hasOverflow

  function scrollTabs(direction: 'left' | 'right') {
    const element = scrollRef.current
    if (!element) return
    const distance = Math.max(220, element.clientWidth * 0.7)
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    })
    window.setTimeout(updateScrollState, 180)
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const links = Array.from(
      scrollRef.current?.querySelectorAll<HTMLAnchorElement>('[role="tab"]') ??
        [],
    )
    if (links.length === 0) return

    const currentIndex = links.indexOf(
      document.activeElement as HTMLAnchorElement,
    )
    let nextIndex = currentIndex
    if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = links.length - 1
    else if (event.key === 'ArrowLeft')
      nextIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1
    else nextIndex = currentIndex >= links.length - 1 ? 0 : currentIndex + 1

    event.preventDefault()
    links[nextIndex]?.focus()
    links[nextIndex]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <nav
      className="shrink-0 border-b border-border bg-background/80 backdrop-blur"
      aria-label={ariaLabel}
    >
      <div className="flex items-stretch">
        {showOverflowControls && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="z-10 shrink-0 rounded-none border-r bg-background/90"
            aria-label={`Cuộn ${ariaLabel.toLocaleLowerCase('vi-VN')} sang trái`}
            disabled={!scrollState.canScrollLeft}
            onClick={() => scrollTabs('left')}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
        )}

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation="horizontal"
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={updateScrollState}
            onKeyDown={handleTabKeyDown}
          >
            <div className="flex min-w-max gap-0.5 px-4 pt-2">
              {tabs.map((tab) => {
                const active = tab.path === activePath
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    role="tab"
                    aria-selected={active}
                    aria-current={active ? 'page' : undefined}
                    tabIndex={
                      tab.path === (activePath ?? tabs[0]?.path) ? 0 : -1
                    }
                    className={cn(
                      'whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      active
                        ? 'border-b-2 border-primary bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {showOverflowControls && (
            <>
              <div
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent transition-opacity',
                  scrollState.canScrollLeft ? 'opacity-100' : 'opacity-0',
                )}
              />
              <div
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent transition-opacity',
                  scrollState.canScrollRight ? 'opacity-100' : 'opacity-0',
                )}
              />
            </>
          )}
        </div>

        {showOverflowControls && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="z-10 shrink-0 rounded-none border-l bg-background/90"
            aria-label={`Cuộn ${ariaLabel.toLocaleLowerCase('vi-VN')} sang phải`}
            disabled={!scrollState.canScrollRight}
            onClick={() => scrollTabs('right')}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  )
}
