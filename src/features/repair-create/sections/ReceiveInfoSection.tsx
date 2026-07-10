/**
 * "Thông tin nhận" fieldset — Ngày hẹn giao, Ngày nhận (default today),
 * Người nhận (read-only current mock user). No Kỹ thuật viên input — the
 * legacy create form assigns a technician later via dispatch, not here.
 */
import { useFormContext, type FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CURRENT_USER } from '@/mock/current-user-mock'
import type { CreateRepairFormValues } from '../RepairCreateForm'

interface ReceiveInfoSectionProps {
  errors: FieldErrors<CreateRepairFormValues>
}

export function ReceiveInfoSection({ errors }: ReceiveInfoSectionProps) {
  const { register } = useFormContext<CreateRepairFormValues>()

  return (
    <section aria-labelledby="section-receive-info">
      <h2
        id="section-receive-info"
        className="sticky top-16 z-10 -mx-6 mb-4 bg-background/95 px-6 py-2 text-base font-semibold backdrop-blur"
      >
        Thông tin nhận
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="ngayHenGiao" className="mb-1.5 block text-sm">
            Ngày hẹn giao
          </Label>
          <Input id="ngayHenGiao" type="date" {...register('ngayHenGiao')} />
        </div>

        <div>
          <Label htmlFor="ngayNhan" className="mb-1.5 block text-sm">
            Ngày nhận <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ngayNhan"
            type="date"
            {...register('ngayNhan')}
            aria-invalid={!!errors.ngayNhan}
            aria-describedby={errors.ngayNhan ? 'ngaynhan-err' : undefined}
          />
          {errors.ngayNhan && (
            <p id="ngaynhan-err" className="mt-1 text-xs text-destructive">
              {errors.ngayNhan.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="nguoiNhan" className="mb-1.5 block text-sm">
            Người nhận
          </Label>
          <Input id="nguoiNhan" value={CURRENT_USER.hoVaTen} readOnly disabled />
        </div>
      </div>

      <Separator className="mt-6" />
    </section>
  )
}
