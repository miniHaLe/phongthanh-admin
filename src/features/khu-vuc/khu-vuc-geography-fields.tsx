/**
 * Custom Tỉnh + Phường/Xã form fields for the Khu Vực catalog editor, injected
 * into the shared CrudSheet via `FieldConfig.renderField`. The province drives a
 * searchable, scoped commune combobox (post-2025 snapshot); picking a commune
 * back-fills the province, and changing the province clears an out-of-scope
 * commune. Reads the live snapshot through the shared geography query.
 */
import { useQuery } from '@tanstack/react-query'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CommuneCombobox } from '@/components/shared/commune-combobox'
import { fetchVietnamAdministrativeSnapshot } from '@/api/vietnam-geography'
import type { FieldRenderContext } from '@/types/crud-types'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'
import { primeKhuVucGeographyNames } from './khu-vuc-geography-names'

export { primeKhuVucGeographyNames } from './khu-vuc-geography-names'

export const KHU_VUC_GEOGRAPHY_QUERY_KEY = ['dia-ly', 'snapshot'] as const

const EMPTY_SNAPSHOT: VietnamAdministrativeSnapshot = {
  version: '',
  effectiveFrom: '',
  sourceDocument: '',
  provinces: [],
  communes: [],
}

function useSnapshot(): VietnamAdministrativeSnapshot {
  const query = useQuery({
    queryKey: KHU_VUC_GEOGRAPHY_QUERY_KEY,
    queryFn: async () => {
      const snapshot = await fetchVietnamAdministrativeSnapshot()
      primeKhuVucGeographyNames(snapshot)
      return snapshot
    },
    staleTime: Infinity,
  })
  return query.data ?? EMPTY_SNAPSHOT
}

/** Tỉnh select — clears the commune when the province changes to a new one. */
export function KhuVucProvinceField(ctx: FieldRenderContext) {
  const { provinces } = useSnapshot()
  const value = (ctx.value as string) ?? ''

  return (
    <Select
      value={value || '__none__'}
      onValueChange={(next) => {
        const code = next === '__none__' ? '' : next
        ctx.onChange(code)
        if (code !== value) ctx.setFieldValue('phuongXaCode', '')
      }}
    >
      <SelectTrigger aria-invalid={ctx.invalid} aria-required>
        <SelectValue placeholder="Chọn tỉnh/thành phố" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="__none__">Chưa chọn</SelectItem>
        {provinces.map((province) => (
          <SelectItem key={province.code} value={province.code}>
            {province.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Phường/Xã combobox — scoped to the chosen Tỉnh; back-fills Tỉnh on select.
 * Reads Tỉnh reactively via useWatch so scope tracks province changes even when
 * the commune value itself doesn't change. */
export function KhuVucCommuneField(ctx: FieldRenderContext) {
  const { communes } = useSnapshot()
  const { control } = useFormContext()
  const watchedProvince = useWatch({ control, name: 'tinhCode' }) as
    | string
    | undefined
  const provinceCode =
    watchedProvince ?? ((ctx.formValues.tinhCode as string) || '')
  const value = (ctx.value as string) ?? ''

  return (
    <CommuneCombobox
      id="khu-vuc-commune"
      communes={communes}
      provinceCode={provinceCode}
      value={value}
      invalid={ctx.invalid}
      onClear={() => ctx.onChange('')}
      onSelect={(commune) => {
        ctx.onChange(commune.code)
        ctx.setFieldValue('tinhCode', commune.provinceCode)
      }}
    />
  )
}
