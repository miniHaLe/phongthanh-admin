/** Barrel for the Phase 1 shared component library (C3 — sole owner). */
export { StatusBadge } from './status-badge'
export { StatusLegend } from './status-legend'
export { StatCard } from './stat-card'
export { EmptyState } from './empty-state'
export { PageHeader } from './page-header'
export { AppBreadcrumb } from './app-breadcrumb'
export { ThemeToggle } from './theme-toggle'
export { BranchSwitcher } from './branch-switcher'
export { PrintMenu } from './print-menu'
export { SheetModal } from './sheet-modal'
export { ToastProvider, toast, notify } from './toast'

export { DataTable } from './data-table/data-table'
export type {
  ColumnPresentation,
  DataTableLayout,
  DataTableProps,
} from './data-table/data-table'
export { DataTablePagination } from './data-table/data-table-pagination'
export {
  API_PAGE_SIZE_OPTIONS,
  COMPACT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE_OPTIONS,
  STANDARD_PAGE_SIZE_OPTIONS,
} from './data-table/page-size-options'
export { DataTableToolbar } from './data-table/data-table-toolbar'
export { DataTableColumnConfig } from './data-table/data-table-column-config'
export type { ColumnDescriptor } from './data-table/data-table-column-config'
export {
  TableDescription,
  TableMetaStack,
  TableProtectedValue,
} from './data-table/table-cell-content'
export type {
  TableDescriptionProps,
  TableMetaStackProps,
  TableProtectedValueProps,
} from './data-table/table-cell-content'
export { CompositeSortHeader } from './data-table/composite-sort-header'
export type {
  CompositeSortHeaderProps,
  CompositeSortOption,
} from './data-table/composite-sort-header'
export { buildSelectionColumn } from './data-table/selection-column'
export { useTableState } from './data-table/use-table-state'
export type { Density } from './data-table/use-table-state'

export { BulkActionsBar } from './bulk-actions-bar'
export {
  ServerAutocomplete,
  type AutocompleteOption,
} from './server-autocomplete'
export { KyPicker, KyRangePicker, KY_OPTIONS } from './ky-picker'
export { LineItemEditor } from './line-item-editor/line-item-editor'
export type { LineColumn, TotalDef } from './line-item-editor/line-item-editor'

export { FilterPanel } from './filter-panel/filter-panel'
export { SavedViews } from './filter-panel/saved-views'
export { useFilterState } from './filter-panel/use-filter-state'
export type { SavedView } from './filter-panel/use-filter-state'
