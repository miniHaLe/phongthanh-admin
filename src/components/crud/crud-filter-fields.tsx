import { useEffect, useId, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { filterControlClassName } from '@/components/shared/filter-panel/filter-control-classes'
import { FilterField } from '@/components/shared/filter-panel/filter-field'
import type { FilterConfig } from '@/types/crud-types'

const ALL_FILTER_VALUES = '__all__'
const TEXT_FILTER_DEBOUNCE_MS = 300

interface CrudFilterFieldsProps<T> {
  filters: FilterConfig<T>[]
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}

interface DebouncedTextFilterProps {
  controlId: string
  fieldKey: string
  label: string
  currentValue: string
  allValues: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}

function DebouncedTextFilter({
  controlId,
  fieldKey,
  label,
  currentValue,
  allValues,
  onChange,
}: DebouncedTextFilterProps) {
  const [localValue, setLocalValue] = useState(currentValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const allValuesRef = useRef(allValues)
  const onChangeRef = useRef(onChange)
  allValuesRef.current = allValues
  onChangeRef.current = onChange

  useEffect(() => {
    setLocalValue(currentValue)
    clearTimeout(timeoutRef.current)
  }, [currentValue])

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current)
    },
    [],
  )

  function handleTextChange(nextValue: string) {
    setLocalValue(nextValue)
    clearTimeout(timeoutRef.current)
    const emitChange = () =>
      onChangeRef.current({
        ...allValuesRef.current,
        [fieldKey]: nextValue,
      })

    if (nextValue === '') {
      emitChange()
      return
    }

    timeoutRef.current = setTimeout(emitChange, TEXT_FILTER_DEBOUNCE_MS)
  }

  return (
    <Input
      id={controlId}
      value={localValue}
      onChange={(event) => handleTextChange(event.target.value)}
      placeholder={label}
      className={filterControlClassName}
    />
  )
}

/** Maps CRUD filter metadata into the shared FilterField control anatomy. */
export function CrudFilterFields<T>({
  filters,
  value,
  onChange,
}: CrudFilterFieldsProps<T>) {
  const uid = useId()

  function handleChange(key: string, nextValue: unknown) {
    onChange({ ...value, [key]: nextValue })
  }

  return filters.map((filter) => {
    const key = String(filter.key)
    const controlId = `${uid}-${key}`
    const currentValue = String(value[key] ?? '')

    if (filter.type === 'date-range') {
      const fromId = `${controlId}-from`
      const toId = `${controlId}-to`
      return (
        <div
          key={key}
          className="grid min-w-0 grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2"
        >
          <FilterField label="Từ ngày" htmlFor={fromId}>
            <Input
              id={fromId}
              type="date"
              aria-label="Từ ngày"
              className={filterControlClassName}
              value={String(value[filter.fromKey] ?? '')}
              onChange={(event) =>
                handleChange(filter.fromKey, event.target.value)
              }
            />
          </FilterField>
          <FilterField label="Đến ngày" htmlFor={toId}>
            <Input
              id={toId}
              type="date"
              aria-label="Đến ngày"
              className={filterControlClassName}
              value={String(value[filter.toKey] ?? '')}
              onChange={(event) => handleChange(filter.toKey, event.target.value)}
            />
          </FilterField>
        </div>
      )
    }

    if (filter.type === 'select') {
      return (
        <FilterField key={key} label={filter.label} htmlFor={controlId}>
          <Select
            value={currentValue}
            onValueChange={(nextValue) =>
              handleChange(
                key,
                nextValue === ALL_FILTER_VALUES ? '' : nextValue,
              )
            }
          >
            <SelectTrigger id={controlId} className={filterControlClassName}>
              <SelectValue placeholder={`Tất cả ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUES}>Tất cả</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      )
    }

    return (
      <FilterField key={key} label={filter.label} htmlFor={controlId}>
        <DebouncedTextFilter
          controlId={controlId}
          fieldKey={key}
          label={filter.label}
          currentValue={currentValue}
          allValues={value}
          onChange={onChange}
        />
      </FilterField>
    )
  })
}
