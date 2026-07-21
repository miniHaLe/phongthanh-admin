/**
 * Table-style option row for the Model autocomplete (legacy parity): shows
 * Sản phẩm | Nhà sản xuất | Tên model | Mã model in a compact grid so a model
 * stays identifiable when the NSX filter is empty. Shared so the repair form
 * can adopt the same row without duplication.
 */
import type { ModelAutocompleteOption } from './model-catalog-data'

/** Autocomplete option enriched with the columns the table row renders. */
export interface ModelRowOption extends ModelAutocompleteOption {
  tenSP: string
  tenNSX: string
  tenModel: string
  maModel?: string
}

export function ModelOptionRow({ option }: { option: ModelRowOption }) {
  return (
    <span className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2">
      <span className="truncate text-muted-foreground" title={option.tenSP}>
        {option.tenSP || '—'}
      </span>
      <span className="truncate text-muted-foreground" title={option.tenNSX}>
        {option.tenNSX || '—'}
      </span>
      <span className="truncate font-medium" title={option.tenModel}>
        {option.tenModel}
      </span>
      {option.maModel && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {option.maModel}
        </span>
      )}
    </span>
  )
}
