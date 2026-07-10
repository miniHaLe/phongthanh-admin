/**
 * "Thông tin khách hàng" fieldset — existing-customer autocomplete only (no
 * inline new-customer name/phone inputs). After a pick, an info panel shows
 * the contact detail plus a "Chọn khách khác" button that clears selection.
 */
import { Controller, useFormContext, type FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ServerAutocomplete } from '@/components/shared'
import { searchCustomers } from '@/domains/repair/mock-data'
import type { CreateRepairFormValues } from '../RepairCreateForm'
import {
  QuickCreateKhachHang,
  type CreatedKhachHang,
} from '../quick-create/QuickCreateKhachHang'

async function searchKhachHang(query: string) {
  const customers = await searchCustomers(query)
  return customers.map((c) => ({
    id: c.id,
    label: c.ten,
    ten: c.ten,
    sdt: c.sdt,
    diaChi: c.diaChi,
  }))
}

interface CustomerSectionProps {
  errors: FieldErrors<CreateRepairFormValues>
}

export function CustomerSection({ errors }: CustomerSectionProps) {
  const { control, setValue } = useFormContext<CreateRepairFormValues>()

  return (
    <section aria-labelledby="section-customer">
      <h2
        id="section-customer"
        className="sticky top-16 z-10 -mx-6 mb-4 bg-background/95 px-6 py-2 text-base font-semibold backdrop-blur"
      >
        Thông tin khách hàng
      </h2>

      <Controller
        name="khachHang"
        control={control}
        render={({ field }) =>
          field.value ? (
            <div className="space-y-3 rounded-md border p-4">
              <div className="grid gap-1.5 text-sm">
                <p>
                  <span className="text-muted-foreground">Họ tên: </span>
                  <span className="font-medium">{field.value.ten}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Điện thoại: </span>
                  <span className="font-medium">{field.value.sdt}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Địa chỉ: </span>
                  <span className="font-medium">
                    {field.value.diaChi || '—'}
                  </span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('khachHang', null)}
              >
                Chọn khách khác
              </Button>
            </div>
          ) : (
            <div>
              <Label className="mb-1.5 block text-sm">
                Khách hàng <span className="text-destructive">*</span>
              </Label>
              <ServerAutocomplete
                value={field.value}
                onChange={(opt) =>
                  field.onChange(opt as CreatedKhachHang | null)
                }
                fetchOptions={searchKhachHang}
                placeholder="Nhập vào Tên / Số điện thoại 1-2"
                quickCreate={{
                  title: 'Thêm khách hàng',
                  renderForm: (close, select) => (
                    <QuickCreateKhachHang close={close} select={select} />
                  ),
                }}
              />
              {errors.khachHang && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.khachHang.message}
                </p>
              )}
            </div>
          )
        }
      />

      <Separator className="mt-6" />
    </section>
  )
}
