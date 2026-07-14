import type { FieldErrors } from 'react-hook-form'
import type { CreateRepairFormValues } from './RepairCreateForm'

const FIELD_TARGETS: ReadonlyArray<
  readonly [keyof CreateRepairFormValues, string]
> = [
  ['model', '[role="combobox"][aria-label="Tên model"]'],
  ['soSerial', '#soSerial'],
  ['moTaHuHong', '#moTaHuHong'],
  ['khuVuc', '[role="combobox"][aria-label="Tên khu vực"]'],
  ['hinhThuc', '[role="radiogroup"][aria-label="Hình thức BH"] [role="radio"]'],
  [
    'khachHang',
    '[role="combobox"][aria-label="Nhập vào Tên / Số điện thoại 1-2"]',
  ],
  ['ngayHenGiao', '#ngayHenGiao'],
  ['ngayNhan', '#ngayNhan'],
]

export function countRepairFormErrors(
  errors: FieldErrors<CreateRepairFormValues>,
): number {
  return Object.values(errors).filter(Boolean).length
}

export function focusFirstInvalidRepairField(
  form: HTMLFormElement | null,
  errors: FieldErrors<CreateRepairFormValues>,
): void {
  if (!form) return

  const targetSelector = FIELD_TARGETS.find(([field]) => errors[field])?.[1]
  const target = targetSelector
    ? form.querySelector<HTMLElement>(targetSelector)
    : null
  if (!target) return

  target.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  target.focus({ preventScroll: true })
}
