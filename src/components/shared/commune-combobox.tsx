/**
 * Searchable, province-scoped Phường/Xã picker (post-2025 snapshot). Extracted
 * to shared so both the customer address form and the Khu Vực catalog/dialog
 * reuse one implementation. Caps results at MAX_RESULTS; filtering is
 * accent-insensitive over "type name provinceName".
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { VietnamCommune } from '@/types/vietnam-administrative-types'
import { normalizeAdministrativeName } from '@/features/customer/customer-commune-search'

const MAX_RESULTS = 80

/** "Phường Tân Định — Tỉnh …" style label; blank when nothing is selected. */
export function communeDisplayName(commune?: VietnamCommune): string {
  if (!commune) return ''
  return `${commune.type ? `${commune.type} ` : ''}${commune.name}`.trim()
}

interface CommuneComboboxProps {
  id: string
  communes: VietnamCommune[]
  provinceCode: string
  value: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  placeholder?: string
  onClear: () => void
  onSelect: (commune: VietnamCommune) => void
}

export function CommuneCombobox({
  id,
  communes,
  provinceCode,
  value,
  disabled,
  invalid,
  describedBy,
  placeholder = 'Tìm phường/xã',
  onClear,
  onSelect,
}: CommuneComboboxProps) {
  const selected = communes.find((commune) => commune.code === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) setQuery(communeDisplayName(selected))
  }, [open, selected])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const scopedCommunes = useMemo(
    () =>
      provinceCode
        ? communes.filter((commune) => commune.provinceCode === provinceCode)
        : communes,
    [communes, provinceCode],
  )

  const options = useMemo(() => {
    const normalized = normalizeAdministrativeName(query)
    const matches = normalized
      ? scopedCommunes.filter((commune) =>
          normalizeAdministrativeName(
            `${commune.type} ${commune.name} ${commune.provinceName}`,
          ).includes(normalized),
        )
      : scopedCommunes
    return matches.slice(0, MAX_RESULTS)
  }, [query, scopedCommunes])

  function pick(commune: VietnamCommune) {
    onSelect(commune)
    setQuery(communeDisplayName(commune))
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={query}
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          aria-invalid={invalid}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className="pr-9"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            if (value) onClear()
            setActiveIndex(-1)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              return
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setOpen(true)
              setActiveIndex((index) =>
                options.length === 0
                  ? -1
                  : Math.min(index + 1, options.length - 1),
              )
              return
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((index) =>
                options.length === 0
                  ? -1
                  : index < 0
                    ? options.length - 1
                    : Math.max(index - 1, 0),
              )
              return
            }
            if (event.key === 'Enter' && activeIndex >= 0) {
              event.preventDefault()
              const option = options[activeIndex]
              if (option) pick(option)
            }
          }}
        />
        <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {open && !disabled && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Không có kết quả
            </p>
          ) : (
            options.map((commune, index) => (
              <button
                key={commune.code}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={commune.code === value}
                className={cn(
                  'flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm',
                  index === activeIndex && 'bg-accent text-accent-foreground',
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(commune)}
              >
                <Check
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    commune.code === value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span>
                  <span className="block">{communeDisplayName(commune)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {commune.provinceName}
                  </span>
                </span>
              </button>
            ))
          )}
          {options.length === MAX_RESULTS && (
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Nhập thêm ký tự để thu hẹp kết quả.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
