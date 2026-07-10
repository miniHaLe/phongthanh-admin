/**
 * "Thông tin sản phẩm" fieldset — 3 independent ServerAutocompletes (no
 * cascade: Model is directly typable even with NSX/Sản phẩm empty), Serial
 * (focusout loads Lịch sử máy on the parent page), Mô tả hư hỏng, Phụ kiện
 * kèm theo, Ngày mua, Nơi mua, Ghi chú.
 */
import { Controller, useFormContext, type FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ServerAutocomplete } from '@/components/shared'
import { MANUFACTURERS, PRODUCTS, MODELS } from '@/domains/repair/reference-data'
import type { CreateRepairFormValues } from '../RepairCreateForm'
import { QuickCreateSanPham } from '../quick-create/QuickCreateSanPham'
import { QuickCreateNhaSanXuat } from '../quick-create/QuickCreateNhaSanXuat'
import { QuickCreateModel } from '../quick-create/QuickCreateModel'

async function searchSanPham(query: string) {
  const q = query.toLowerCase()
  return PRODUCTS.filter((p) => p.ten.toLowerCase().includes(q)).map((p) => ({
    id: p.id,
    label: p.ten,
  }))
}

async function searchNhaSanXuat(query: string) {
  const q = query.toLowerCase()
  return MANUFACTURERS.filter((m) => m.ten.toLowerCase().includes(q)).map(
    (m) => ({ id: m.id, label: m.ten }),
  )
}

async function searchModel(query: string) {
  const q = query.toLowerCase()
  return MODELS.filter((m) => m.ten.toLowerCase().includes(q)).map((m) => ({
    id: m.id,
    label: m.ten,
  }))
}

interface DeviceSectionProps {
  errors: FieldErrors<CreateRepairFormValues>
  onSerialBlur: (serial: string) => void
}

export function DeviceSection({ errors, onSerialBlur }: DeviceSectionProps) {
  const { control, register } = useFormContext<CreateRepairFormValues>()

  return (
    <section aria-labelledby="section-device">
      <h2
        id="section-device"
        className="sticky top-16 z-10 -mx-6 mb-4 bg-background/95 px-6 py-2 text-base font-semibold backdrop-blur"
      >
        Thông tin sản phẩm
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sản phẩm */}
        <div>
          <Label className="mb-1.5 block text-sm">Sản phẩm</Label>
          <Controller
            name="sanPham"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={field.onChange}
                fetchOptions={searchSanPham}
                placeholder="Tên sản phẩm"
                quickCreate={{
                  title: 'Thêm sản phẩm',
                  renderForm: (close, select) => (
                    <QuickCreateSanPham close={close} select={select} />
                  ),
                }}
              />
            )}
          />
        </div>

        {/* Nhà sản xuất */}
        <div>
          <Label className="mb-1.5 block text-sm">Nhà sản xuất</Label>
          <Controller
            name="nhaSanXuat"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={field.onChange}
                fetchOptions={searchNhaSanXuat}
                placeholder="Tên nhà sản xuất"
                quickCreate={{
                  title: 'Thêm nhà sản xuất',
                  renderForm: (close, select) => (
                    <QuickCreateNhaSanXuat close={close} select={select} />
                  ),
                }}
              />
            )}
          />
        </div>

        {/* Model — required, directly typable, no cascade */}
        <div>
          <Label className="mb-1.5 block text-sm">
            Model <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={field.onChange}
                fetchOptions={searchModel}
                placeholder="Tên model"
                quickCreate={{
                  title: 'Thêm model',
                  renderForm: (close, select) => (
                    <QuickCreateModel close={close} select={select} />
                  ),
                }}
              />
            )}
          />
          {errors.model && (
            <p className="mt-1 text-xs text-destructive">
              {errors.model.message}
            </p>
          )}
        </div>

        {/* Số Serial */}
        <div>
          <Label htmlFor="soSerial" className="mb-1.5 block text-sm">
            Số Serial <span className="text-destructive">*</span>
          </Label>
          <Input
            id="soSerial"
            {...register('soSerial', {
              onBlur: (e) => onSerialBlur(e.target.value),
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

        {/* Ngày mua */}
        <div>
          <Label htmlFor="ngayMua" className="mb-1.5 block text-sm">
            Ngày mua
          </Label>
          <Input id="ngayMua" type="date" {...register('ngayMua')} />
        </div>

        {/* Nơi mua */}
        <div>
          <Label htmlFor="noiMua" className="mb-1.5 block text-sm">
            Nơi mua
          </Label>
          <Input id="noiMua" {...register('noiMua')} placeholder="Nơi mua" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Mô tả hư hỏng */}
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

        {/* Phụ kiện kèm theo */}
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

        {/* Ghi chú */}
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

      <Separator className="mt-6" />
    </section>
  )
}
