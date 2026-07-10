/**
 * ServerAutocomplete — async option fetch with a hidden-id binding (mirrors the
 * legacy visible-text + hidden-id input pair). Optional `[+]` quick-create modal
 * creates a record and auto-selects it. Debounced fetch (250ms).
 */
import { useEffect, useRef, useState } from 'react'
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
  placeholder?: string
  quickCreate?: QuickCreateConfig
  className?: string
  debounceMs?: number
}

export function ServerAutocomplete({
  value,
  onChange,
  fetchOptions,
  placeholder = 'Tìm kiếm…',
  quickCreate,
  className,
  debounceMs = 250,
}: ServerAutocompleteProps) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!open) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        setOptions(await fetchOptions(query))
      } finally {
        setLoading(false)
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
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-1.5">
        <Input
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (value) onChange(null)
          }}
          onFocus={() => setOpen(true)}
          className="h-9"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
        />
        {quickCreate && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Thêm mới"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {loading ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">Đang tải…</li>
          ) : options.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              Không có kết quả
            </li>
          ) : (
            options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value?.id === opt.id}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => pick(opt)}
                >
                  {opt.label}
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
