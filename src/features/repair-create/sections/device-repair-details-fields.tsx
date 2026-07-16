import { useFormContext, type FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { RepairFormValues } from '../repair-form-contract'

export function DeviceRepairDetailsFields({
  errors,
  onSerialBlur,
}: {
  errors: FieldErrors<RepairFormValues>
  onSerialBlur: (serial: string) => void
}) {
  const { register } = useFormContext<RepairFormValues>()

  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="soSerial" className="mb-1.5 block text-sm">
            Số Serial <span className="text-destructive">*</span>
          </Label>
          <Input
            id="soSerial"
            {...register('soSerial', {
              onBlur: (event) => onSerialBlur(event.target.value),
            })}
            placeholder="SN…"
            autoComplete="off"
            aria-invalid={!!errors.soSerial}
            aria-describedby={errors.soSerial ? 'serial-err' : undefined}
          />
          {errors.soSerial && (
            <p id="serial-err" className="mt-1 text-xs text-destructive">
              {errors.soSerial.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ngayMua" className="mb-1.5 block text-sm">
            Ngày mua
          </Label>
          <Input id="ngayMua" type="date" {...register('ngayMua')} />
        </div>

        <div>
          <Label htmlFor="noiMua" className="mb-1.5 block text-sm">
            Nơi mua
          </Label>
          <Input id="noiMua" {...register('noiMua')} placeholder="Nơi mua" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="moTaHuHong" className="mb-1.5 block text-sm">
            Mô tả hư hỏng <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="moTaHuHong"
            {...register('moTaHuHong')}
            placeholder="Mô tả chi tiết tình trạng hư hỏng của thiết bị…"
            rows={3}
            aria-invalid={!!errors.moTaHuHong}
            aria-describedby={errors.moTaHuHong ? 'mota-err' : undefined}
          />
          {errors.moTaHuHong && (
            <p id="mota-err" className="mt-1 text-xs text-destructive">
              {errors.moTaHuHong.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phuKienKemTheo" className="mb-1.5 block text-sm">
            Phụ kiện kèm theo
          </Label>
          <Textarea
            id="phuKienKemTheo"
            {...register('phuKienKemTheo')}
            placeholder="Phụ kiện đi kèm…"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="ghiChu" className="mb-1.5 block text-sm">
            Ghi chú
          </Label>
          <Textarea
            id="ghiChu"
            {...register('ghiChu')}
            placeholder="Ghi chú…"
            rows={2}
          />
        </div>
      </div>
    </>
  )
}
