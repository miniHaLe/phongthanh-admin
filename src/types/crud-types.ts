/**
 * Generic CRUD type contracts for CrudTablePage and its config files.
 * All 23 master-data configs conform to CrudConfig<T>.
 */
import type { ZodTypeAny } from 'zod'
import type { ReactNode } from 'react'
import type { ListParams, PagedResult } from '@/mock/seed'

export type { ListParams, PagedResult }

export type CrudLookups = Readonly<Record<string, unknown>>

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'combobox'
  | 'switch'
  | 'phone'
  | 'email'
  | 'money'
  | 'radio'

export interface ColumnConfig<T> {
  key: keyof T
  header: string
  sortable?: boolean
  width?: number
  renderCell?: (val: T[keyof T], row: T, lookups?: CrudLookups) => ReactNode
  hidden?: boolean
}

/** Context handed to a custom field renderer (`FieldConfig.renderField`). */
export interface FieldRenderContext {
  value: unknown
  onChange: (value: unknown) => void
  /** Snapshot of the whole record at render time. NON-reactive: it does not
   * update when a sibling field changes. For a dependent field that must react
   * to another (e.g. a commune scoped by the chosen province), read that field
   * with react-hook-form's `useWatch` inside your renderer instead of this. */
  formValues: Record<string, unknown>
  /** Set another field's value (e.g. back-fill Tỉnh when a commune is picked). */
  setFieldValue: (key: string, value: unknown) => void
  invalid?: boolean
  describedBy?: string
}

export interface FieldConfig<T> {
  key: keyof T
  label: string
  type: FieldType
  required?: boolean
  options?: { label: string; value: string }[]
  loadOptions?: () => Promise<{ label: string; value: string }[]>
  zodSchema?: ZodTypeAny
  span?: 1 | 2
  /** Field only shown in create mode, not edit mode (e.g. password). */
  createOnly?: boolean
  /** Escape hatch for fields the built-in types can't express (e.g. a
   * searchable, province-dependent commune combobox). When set, CrudSheet
   * renders this instead of the type-driven control. */
  renderField?: (ctx: FieldRenderContext) => ReactNode
}

export type FilterConfig<T> = {
  key: keyof T
  label: string
  options?: { label: string; value: string }[]
  loadOptions?: () => Promise<{ label: string; value: string }[]>
} & (
  | {
      type: 'text' | 'select'
      fromKey?: never
      toKey?: never
    }
  | {
      type: 'date-range'
      fromKey: string
      toKey: string
    }
)

export interface MockApi<T> {
  list: (params: ListParams) => Promise<PagedResult<T>>
  get: (id: string) => Promise<T>
  create: (data: Omit<T, 'id' | 'createdAt'>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
}

export interface CrudConfig<T extends { id: string }> {
  resourceKey: string
  title: string
  columns: ColumnConfig<T>[]
  fields: FieldConfig<T>[]
  filters?: FilterConfig<T>[]
  defaultSort?: { key: keyof T; dir: 'asc' | 'desc' }
  pageSize?: number
  mockApi: MockApi<T>
  /** Opt-in row multi-select + "Chọn tất cả" header + bulk-delete toolbar. */
  bulkDelete?: boolean
  /** Opt-in "Lưu & Thêm mới" footer button on the create/edit sheet. */
  saveAndNew?: boolean
  /** Opt-in "Xuất Excel" toolbar button for the current page's display values. */
  export?: boolean
  /** Override the "Thêm" toolbar button label, or hide it with false. */
  addLabel?: string | false
}
