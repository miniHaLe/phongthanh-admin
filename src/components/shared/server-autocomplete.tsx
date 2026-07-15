/**
 * ServerAutocomplete — async option fetch with a hidden-id binding (mirrors the
 * legacy visible-text + hidden-id input pair). Optional `[+]` quick-create modal
 * creates a record and auto-selects it. Debounced fetch (250ms).
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface AutocompleteOption {
  id: string
  label: string
}

export interface QuickCreateConfig {
  title: string
  ariaLabel?: string
  /** Render the create form; call `select` with the created option to finish. */
  renderForm: (
    close: () => void,
    select: (opt: AutocompleteOption) => void,
  ) => React.ReactNode
}

interface ServerAutocompleteProps {
  value: AutocompleteOption | null
  onChange: (opt: AutocompleteOption | null) => void
  fetchOptions: (query: string) => Promise<AutocompleteOption[]>
  inputId?: string
  ariaLabel?: string
  required?: boolean
  placeholder?: string
  quickCreate?: QuickCreateConfig
  className?: string
  debounceMs?: number
  disabled?: boolean
  emptyMessage?: string
  renderOption?: (opt: AutocompleteOption) => ReactNode
}

export function ServerAutocomplete({
  value,
  onChange,
  fetchOptions,
  inputId,
  ariaLabel,
  required = false,
  placeholder = 'Tìm kiếm…',
  quickCreate,
  className,
  debounceMs = 250,
  disabled = false,
  emptyMessage = 'Không có kết quả',
  renderOption,
}: ServerAutocompleteProps) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const requestSequence = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    setQuery(value?.label ?? '')
  }, [value])

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [])

  useEffect(() => {
    if (!open) return
    if (timer.current) clearTimeout(timer.current)
    const sequence = ++requestSequence.current
    timer.current = setTimeout(async () => {
      setLoading(true)
      setLoadFailed(false)
      try {
        const next = await fetchOptions(query)
        if (sequence === requestSequence.current) {
          setOptions(next)
          setActiveIndex(next.length > 0 ? 0 : -1)
        }
      } catch {
        if (sequence === requestSequence.current) {
          setOptions([])
          setActiveIndex(-1)
          setLoadFailed(true)
        }
      } finally {
        if (sequence === requestSequence.current) setLoading(false)
      }
    }, debounceMs)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, open, fetchOptions, debounceMs])

  function pick(opt: AutocompleteOption) {
    onChange(opt)
    setQuery(opt.label)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (options.length === 0) return
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => {
        const start = current < 0 ? (direction > 0 ? -1 : 0) : current
        return (start + direction + options.length) % options.length
      })
      return
    }

    if (event.key === 'Enter' && open && activeIndex >= 0) {
      const active = options[activeIndex]
      if (active) {
        event.preventDefault()
        pick(active)
      }
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div className="flex items-center gap-1.5">
        <Input
          id={inputId}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (value) onChange(null)
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 sm:h-9"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={
            open && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-label={ariaLabel ?? placeholder}
          aria-required={required || undefined}
        />
        {quickCreate && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
            aria-label={quickCreate.ariaLabel ?? quickCreate.title}
            disabled={disabled}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {loading ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              Đang tải…
            </li>
          ) : loadFailed ? (
            <li role="alert" className="px-2 py-1.5 text-sm text-destructive">
              Không thể tải dữ liệu. Vui lòng thử lại.
            </li>
          ) : options.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              {emptyMessage}
            </li>
          ) : (
            options.map((opt, index) => (
              <li key={opt.id}>
                <button
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={value?.id === opt.id}
                  className={cn(
                    'min-h-11 w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent sm:min-h-8',
                    index === activeIndex && 'bg-accent',
                  )}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => pick(opt)}
                >
                  {renderOption ? renderOption(opt) : opt.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {quickCreate && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{quickCreate.title}</DialogTitle>
            </DialogHeader>
            {quickCreate.renderForm(
              () => setCreateOpen(false),
              (opt) => {
                setCreateOpen(false)
                pick(opt)
              },
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
