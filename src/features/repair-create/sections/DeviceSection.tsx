import type { FieldErrors } from 'react-hook-form'
import { Separator } from '@/components/ui/separator'
import type { RepairFormValues } from '../repair-form-contract'
import { DeviceCatalogFields } from './device-catalog-fields'
import { DeviceRepairDetailsFields } from './device-repair-details-fields'

interface DeviceSectionProps {
  errors: FieldErrors<RepairFormValues>
  onSerialBlur: (serial: string) => void
}

export function DeviceSection({ errors, onSerialBlur }: DeviceSectionProps) {
  return (
    <section aria-labelledby="section-device">
      <h2
        id="section-device"
        className="-mx-4 mb-4 bg-background/95 px-4 py-2 text-base font-semibold backdrop-blur sm:sticky sm:top-16 sm:-mx-6 sm:px-6"
      >
        Thông tin sản phẩm
      </h2>

      <DeviceCatalogFields errors={errors} />
      <DeviceRepairDetailsFields errors={errors} onSerialBlur={onSerialBlur} />
      <Separator className="mt-6" />
    </section>
  )
}
