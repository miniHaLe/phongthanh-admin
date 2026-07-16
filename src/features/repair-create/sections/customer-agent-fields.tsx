import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ServerAutocomplete } from '@/components/shared'
import type { RepairFormValues } from '../repair-form-contract'
import { searchRepairDealers } from '../repair-dealer-options'

export function CustomerAgentFields() {
  const { control, register } = useFormContext<RepairFormValues>()
  const dealer = useWatch({ control, name: 'daiLy' })

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <Label htmlFor="repair-route" className="mb-1.5 block text-sm">
          Tuyến:
        </Label>
        <Input id="repair-route" {...register('tuyen')} />
      </div>

      <div>
        <Label htmlFor="repair-dealer" className="mb-1.5 block text-sm">
          Đại lý
        </Label>
        <Controller
          name="daiLy"
          control={control}
          render={({ field }) => (
            <ServerAutocomplete
              inputId="repair-dealer"
              ariaLabel="Đại lý"
              value={field.value}
              onChange={field.onChange}
              fetchOptions={searchRepairDealers}
              placeholder="Đại lý"
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="repair-primary-dealer" className="mb-1.5 block text-sm">
          Đại lý chính:
        </Label>
        <Input
          id="repair-primary-dealer"
          value={dealer?.daiLyChinh ?? ''}
          readOnly
          aria-live="polite"
        />
      </div>

      <div>
        <Label htmlFor="repair-phone-2" className="mb-1.5 block text-sm">
          Điện thoại 2:
        </Label>
        <Input
          id="repair-phone-2"
          inputMode="tel"
          autoComplete="tel"
          {...register('dienThoai2')}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="repair-email" className="mb-1.5 block text-sm">
          Email:
        </Label>
        <Input
          id="repair-email"
          type="email"
          autoComplete="email"
          {...register('email')}
        />
      </div>
    </div>
  )
}
